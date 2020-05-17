import { CreateInternalMocker, ExpectationData, INTERNAL_MOCKER_NAME, MockType } from "./InternalMocker";
import { createMockedFunction } from "./MockedFunction";
import { BaseOngoingStubbing, OngoingStubbing, OnGoingStubs } from "./OnGoingStubs";
import { createdMocks } from "./UmbraTestRunnerIntegration";

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

type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);

class InvocationHandler<T extends object> implements ProxyHandler<T> {

    private readonly cachedFields: any = {};
    private readonly classPrototype: any | null | undefined;
    private readonly realObject: T;
    private readonly mockName: string | null;
    private readonly options: MockOptions;
    private readonly mockType: MockType;
    private cachedFunction: any | null = null;

    constructor(clazz: any | null | undefined, realObject: T, mockName: string | null, options: MockOptions, mockType: MockType) {
        this.classPrototype = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;
    }

    public apply(target: T, thisArg: any, argArray?: any): any {
        if (target === this.realObject) {
            this.mockSingleFunctionIfNecessary(this.realObject as any);
            return this.cachedFunction(...argArray);
        }

        (target as any)(argArray);
    }

    public construct(target: T, argArray: any, newTarget?: any): object {
        if (this.mockType === MockType.Partial) {
            return partialMock(new (target as any)(...argArray));
        }

        return {};
    }

    public get<F extends MockableFunction>(target: T, p: PropertyKey, receiver: any): any {
        if (p === "prototype") {
            return Reflect.get(this.realObject, p);
        }

        if (p === INTERNAL_MOCKER_NAME || Object.getPrototypeOf(Function)[p] !== undefined) {
            // this will happen if we're mocking a single function
            this.mockSingleFunctionIfNecessary<F>(this.realObject as any);

            return this.cachedFunction[p];
        }

        const cachedField: any = this.cachedFields[p];
        if (cachedField !== null && cachedField !== undefined) {
            return cachedField;
        }

        let realValue: any = null;
        if (this.classPrototype || this.realObject) {
            const realValueDescriptor = this.getPropertyDescriptor(this.classPrototype, p) ?? this.getPropertyDescriptor(this.realObject, p);
            if (realValueDescriptor === undefined) {
                if ((this.classPrototype && (this.mockType === MockType.Instance || this.mockType === MockType.Partial)) ||
                    (this.realObject && this.mockType === MockType.Static || this.mockType === MockType.Partial))
                {
                    const validMethods = this.ownKeys(target).join(", ");
                    throw new Error(`Property "${p.toString()}" was access on class "${this.classPrototype.constructor.name}". ` +
                        `Ensure property exists on the prototype or existing object. Valid methods: [${validMethods}]`);
                }
            } else {
                realValue = realValueDescriptor.value;
                if (realValue === null || realValue === undefined) {
                    return realValue;
                }
            }
        }

        const realValueType = typeof realValue;
        if (realValueType === "number" || realValueType === "string" || realValueType === "boolean" || realValue instanceof Date ||
                realValue instanceof RegExp || Array.isArray(realValue))
        {
            return realValue;
        }

        let newCachedField: any;
        const mockName: string = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
        switch (this.mockType) {
            case MockType.Instance:
                newCachedField = mock(realValue, mockName);
                break;
            case MockType.Static:
            case MockType.Partial:
                newCachedField = partialMock(realValue);
                break;
            default:
                throw new Error("Unknown mock type " + MockType[this.mockType]);
        }

        this.cachedFields[p] = newCachedField;
        return newCachedField;
    }

    public ownKeys(target: T): PropertyKey[] {
        const normalTargetKeys = Reflect.ownKeys(target);
        const cachedPrototypeKeys = Reflect.ownKeys(this.cachedFields);
        for (const key of normalTargetKeys) {
            if (key === INTERNAL_MOCKER_NAME) {
                continue;
            }

            if (cachedPrototypeKeys.indexOf(key) === -1) {
                cachedPrototypeKeys.push(key);
            }
        }
        return cachedPrototypeKeys;
    }

    public getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
        if (this.cachedFields[p]) {
            return Object.getOwnPropertyDescriptor(this.cachedFields, p);
        }

        return Reflect.getOwnPropertyDescriptor(target, p);
    }

    private mockSingleFunctionIfNecessary<F extends MockableFunction>(realFunction: F) {
        if (!this.cachedFunction) {
            const mockedFunction: F = createMockedFunction();
            if (this.mockName !== null) {
                Reflect.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            CreateInternalMocker<F>(mockedFunction, realFunction, this.mockName, this.options, this.mockType);
            this.cachedFunction = mockedFunction;
        }
    }

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

    /*
        getPrototypeOf(target: T): object | null {
            console.log("blah");
        }
        setPrototypeOf(target: T, v: any): boolean {
            console.log("blah");
        }
        preventExtensions(target: T): boolean {
            console.log("blah");
        }

        has?(target: T, p: PropertyKey): boolean {
            console.log("blah");
        }
        set?(target: T, p: PropertyKey, value: any, receiver: any): boolean {
            console.log("blah");
        }
        deleteProperty?(target: T, p: PropertyKey): boolean {
            console.log("blah");
        }
        defineProperty?(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
            console.log("blah");
        }

    */
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
    // Passing a stub function here allows us to pass functions as well as objects to the proxy. This is because the
    // function is both an object and marked as [[Callable]]
    const stubFunction = (() => { /* intentionally blank */ }) as T;
    if (typeof clazz === "string") {
        mockName = clazz;
        clazz = undefined;
    }
    if (!mockName) {
        mockName = null;
    }

    const proxy = new Proxy<T>(stubFunction, new InvocationHandler<T>(clazz ? clazz.prototype : null, stubFunction, mockName, options, MockType.Instance));
    if (createdMocks) {
        createdMocks.push(proxy);
    }
    return proxy;
}

function staticMock<T extends object>(clazz?: T): T {
    const stubFunction = (() => { /* intentionally blank */ }) as T;
    return new Proxy(stubFunction, new InvocationHandler(clazz, stubFunction, null, defaultOptions, MockType.Static));
}

function partialMock<T extends object>(realObject: T, mockName: string | null = null, options: MockOptions = defaultOptions): T {
    return new Proxy(realObject, new InvocationHandler<T>(Object.getPrototypeOf(realObject), realObject, mockName, options, MockType.Partial));
}

function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F> {
    return new OnGoingStubs(mockedFunction) as any as OngoingStubbing<F>;
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