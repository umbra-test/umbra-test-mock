import { CreateInternalMocker, ExpectationData, INTERNAL_MOCKER_NAME, MockType, GetInternalMockerSafe } from "./InternalMocker";
import { createMockedFunction } from "./MockedFunction";
import { BaseOngoingStubbing, OngoingStubbing, OnGoingStubs, ReturnableOnGoingStubbing } from "./OnGoingStubs";
import { createdMocks } from "./UmbraTestRunnerIntegration";

type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);
type Answer<F extends MockableFunction> = (...args: Parameters<F>) => ReturnType<F>;
type MockableFunction = (...args: any[]) => any;

const objectPrototype = Object.prototype;

enum StrictnessMode {
    Strict,
    Loose,
}

interface MockOptions {
    strictMode: StrictnessMode;
    inOrder: boolean;
}


class InvocationHandler<T extends object> implements ProxyHandler<T> {

    private readonly classPrototype: any | null | undefined;
    private readonly realObject: T;
    private readonly mockName: string | null;
    private readonly options: MockOptions;
    private readonly mockType: MockType;
    private readonly internalMocker: any;

    constructor(clazz: any | null | undefined, mockedFunction: any, realObject: T, mockName: string | null, options: MockOptions, mockType: MockType) {
        this.classPrototype = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;

        if (this.mockName !== null) {
            Reflect.defineProperty(realObject, "name", { value: this.mockName });
        }
        this.internalMocker = CreateInternalMocker<any>(mockedFunction, realObject, this.mockName, this.options, this.mockType);
    }

    public apply(target: T, thisArg: any, argArray?: any): any {
        return (target as any).apply(thisArg, argArray);
    }

    public construct(target: T, argArray: any, newTarget?: any): object {
        if (this.mockType === MockType.Partial) {
            return partialMock(new (this.realObject as any)(...argArray));
        }

        return {};
    }

    public get(target: T, p: PropertyKey, receiver: any): any {
        if (p === INTERNAL_MOCKER_NAME) {
            return this.internalMocker;
        }

        let realValue: any = Reflect.get(this.realObject, p, receiver);
        if (realValue !== undefined) {
            if (typeof realValue !== "function" || this.mockType !== MockType.Partial || GetInternalMockerSafe(realValue) !== null) {
                return realValue;
            }
        }

        if (this.classPrototype && realValue === undefined) {
            const propertyDescriptor = this.getPropertyDescriptor(this.classPrototype, p);
            if (propertyDescriptor !== undefined) {
                realValue = propertyDescriptor.value;
            } else if (this.mockType === MockType.Instance) {
                return undefined;
            }
        }

        if (this.realObject instanceof Promise && p === "then") {
            // Native promise methods must be bound back to the original Promise object.
            // Passing the proxy will cause you to get an error: incompatible receiver object promise
            realValue = realValue.bind(this.realObject);
        }

        let newCachedField: any;
        const mockName: string = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
        switch (this.mockType) {
            case MockType.Instance:
                newCachedField = mock(realValue, mockName);
                break;
            case MockType.Static:
            case MockType.Partial:
                if (!realValue) {
                    return realValue;
                }
                newCachedField = partialMock(realValue);
                break;
            default:
                throw new Error("Unknown mock type " + MockType[this.mockType]);
        }

        Reflect.set(this.realObject, p, newCachedField);
        return newCachedField;
    }

    public deleteProperty(target: T, p: PropertyKey): boolean {
        return Reflect.deleteProperty(this.realObject, p);
    }

    public set(target: T, p: PropertyKey, value: any, receiver: any): boolean {
        return Reflect.set(this.realObject, p, value, receiver);
    }

    public ownKeys(target: T): PropertyKey[] {
        let normalTargetKeys = Reflect.ownKeys(target);
        if (this.mockType === MockType.Static) {
            normalTargetKeys = normalTargetKeys.concat(Reflect.ownKeys(this.classPrototype));
        }
        const resultKeys = Reflect.ownKeys(this.realObject);
        const internalMockIndex = resultKeys.indexOf(INTERNAL_MOCKER_NAME);
        if (internalMockIndex !== -1) {
            resultKeys.splice(internalMockIndex, 1);
        }
        for (const key of normalTargetKeys) {
            if (key === INTERNAL_MOCKER_NAME) {
                continue;
            }

            if (resultKeys.indexOf(key) === -1) {
                resultKeys.push(key);
            }
        }

        return resultKeys;
    }

    public getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, p);
        if (descriptor !== undefined) {
            return descriptor;
        }

        return Reflect.getOwnPropertyDescriptor(this.realObject, p);
    }

    /*public has(target: T, p: PropertyKey): boolean {
        console.log("blah");
        return Reflect.has(target, p);
    }

    public getPrototypeOf(target: T): object | null {
        console.log("blah");
        return Reflect.getPrototypeOf(target);
    }

    public setPrototypeOf(target: T, v: any): boolean {
        console.log("blah");
        return Reflect.setPrototypeOf(target, v);
    }

    public preventExtensions(target: T): boolean {
        console.log("blah");
        return Reflect.preventExtensions(target);
    }

    public defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
        console.log("blah");
        return Reflect.defineProperty(target, p, attributes);
    }*/

    private getPropertyDescriptor(object: any, propertyKey: PropertyKey): PropertyDescriptor | undefined {
        if (!object) {
            return undefined;
        }

        let searchTarget = object;
        while (searchTarget !== objectPrototype) {
            const propertyDescriptor: PropertyDescriptor | undefined = Reflect.getOwnPropertyDescriptor(searchTarget, propertyKey);
            if (propertyDescriptor !== undefined) {
                return propertyDescriptor;
            }

            searchTarget = Reflect.getPrototypeOf(searchTarget);
        }

        return undefined;
    }
}

let defaultOptions: MockOptions = {
    strictMode: StrictnessMode.Strict,
    inOrder: false
};

function setDefaultOptions(options: Partial<MockOptions>) {
    defaultOptions = Object.assign(defaultOptions, options);
}

function mock<T>(object?: ClassConstructor<T>, mockName?: string): T;
function mock<T extends object>(mockName: string): T;
function mock<T extends object>(clazz?: ClassConstructor<T> | string, mockName?: string | null, options: MockOptions = defaultOptions): T {
    // Passing a function here allows us to pass functions as well as objects to the proxy. This is because the
    // function is both an object and marked as [[Callable]]
    const stubFunction = createMockedFunction() as T;
    if (typeof clazz === "string") {
        mockName = clazz;
        clazz = undefined;
    }
    if (!mockName) {
        mockName = null;
    }

    const proxy = new Proxy<T>(stubFunction,
        new InvocationHandler<T>(clazz ? clazz.prototype : null, stubFunction, stubFunction, mockName, options, MockType.Instance));
    if (createdMocks) {
        createdMocks.push(proxy);
    }
    return proxy;
}

function staticMock<T extends object>(clazz?: T): T {
    const stubFunction = createMockedFunction() as T;
    return new Proxy(stubFunction, new InvocationHandler(clazz, stubFunction, stubFunction, null, defaultOptions, MockType.Static));
}

function partialMock<T extends object>(realObject: T, mockName: string | null = null, options: MockOptions = defaultOptions): T {
    // In the case of a partial mock, we have a real object, so we can know if the target object behaves like a function. This is important because if we pass
    // a function to the proxy, it must match certain requirements of the original target. For example, Reflect.ownKeys(function() {}) must return a
    // "prototype" key, which will not exist on Reflect.ownKeys({})
    const stubFunction = (typeof realObject === "function" ? createMockedFunction() : {}) as T;
    return new Proxy(stubFunction, new InvocationHandler<T>(Object.getPrototypeOf(realObject), stubFunction, realObject, mockName, options, MockType.Partial));
}

function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F>;
function expect<C extends object, F extends MockableFunction>(mockedFunction: ClassConstructor<C>):
    ReturnableOnGoingStubbing<F, ReturnableOnGoingStubbing<F, any>>;
function expect<F extends any>(data: F): OngoingStubbing<any>;
function expect<F extends MockableFunction>(mockedFunction: any): OngoingStubbing<F> {
    return new OnGoingStubs(mockedFunction) as any;
}

interface InOrderExpectation {
    expectations: ExpectationData<any>[];
    currentIndex: number;
}

function inOrder(...stubs: BaseOngoingStubbing<any, any>[]) {
    const inOrderExpectation: InOrderExpectation = {
        expectations: [],
        currentIndex: 0
    };
    const castStubs = stubs as OnGoingStubs<any>[];
    for (const castStub of castStubs) {
        const expectation: ExpectationData<any> = castStub.getExpectation();
        inOrderExpectation.expectations.push(expectation);
        expectation.inOrderOverride = inOrderExpectation;
    }
}

export {
    inOrder,
    mock,
    partialMock,
    staticMock,
    expect,
    setDefaultOptions,
    MockableFunction,
    InOrderExpectation,
    Answer,
    MockOptions,
    StrictnessMode,
    ClassConstructor,
};