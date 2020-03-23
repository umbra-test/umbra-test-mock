import { CreateInternalMocker, ExpectationData, INTERNAL_MOCKER_NAME, MockType } from "./InternalMocker";
import { createMockedFunction } from "./MockedFunction";
import { BaseOngoingStubbing, OngoingStubbing, OnGoingStubs } from "./OnGoingStubs";
import { createdMocks } from "./UmbraTestRunnerIntegration";

type Answer<F extends MockableFunction> = (...args: Parameters<F>) => ReturnType<F>;
type MockableFunction = (...args: any[]) => any;

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

    private readonly cachedPrototypeStubs: any = {};
    private readonly cachedStaticStubs: any = {};
    private readonly clazz: any | null | undefined;
    private readonly realObject: T;
    private readonly mockName: string | null;
    private readonly options: MockOptions;
    private readonly mockType: MockType;
    private cachedFunctionStub: any | null = null;

    constructor(clazz: any | null | undefined, realObject: T, mockName: string | null, options: MockOptions, mockType: MockType) {
        this.clazz = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;
    }

    public apply(target: T, thisArg: any, argArray?: any): any {
        if (target === this.realObject) {
            this.mockSingleFunctionIfNecessary(this.realObject as any);
            return this.cachedFunctionStub(...argArray);
        }

        (target as any)(argArray);
    }

    public get<F extends MockableFunction>(target: T, p: PropertyKey, receiver: any): any {
        if (p === INTERNAL_MOCKER_NAME || Object.getPrototypeOf(Function)[p] !== undefined) {
            // this will happen if we're mocking a single function
            this.mockSingleFunctionIfNecessary<F>((target as any)[p]);

            return this.cachedFunctionStub[p];
        }

        let targetCache: any;
        if (this.clazz) {
            const realPrototypeMethod = this.clazz[p];
            if (realPrototypeMethod === null || realPrototypeMethod === undefined) {
                const realStaticMethod = (this.realObject as any)[p];
                if (realStaticMethod !== null && realStaticMethod !== undefined) {
                    if (this.realObject) {
                        targetCache = this.cachedStaticStubs;
                    }
                } else {
                    const validMethods = Object.getOwnPropertyNames(this.clazz).join(", ");
                    throw new Error(`Method "${p.toString()}" was called on class "${this.clazz.constructor.name}". ` +
                        `Ensure method exists on prototype. Valid methods: [${validMethods}]`);
                }
            } else {
                targetCache = this.cachedPrototypeStubs;
            }
        } else {
            targetCache = this.cachedStaticStubs;
        }
        if (!targetCache[p]) {
            const mockedFunction: F = createMockedFunction();
            const mockName: string = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
            Object.defineProperty(mockedFunction, "name", { value: mockName });
            CreateInternalMocker<F>(mockedFunction, (target as any)[p], mockName, this.options, this.mockType);
            targetCache[p] = mockedFunction;
        }

        return targetCache[p];
    }

    public ownKeys(target: T): PropertyKey[] {
        const normalTargetKeys = Reflect.ownKeys(target);
        const cachedPrototypeKeys = Reflect.ownKeys(this.cachedPrototypeStubs);
        for (const key of normalTargetKeys) {
            if (cachedPrototypeKeys.indexOf(key) === -1) {
                cachedPrototypeKeys.push(key);
            }
        }
        return cachedPrototypeKeys;
    }

    public getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
        if (this.cachedPrototypeStubs[p]) {
            return Object.getOwnPropertyDescriptor(this.cachedPrototypeStubs, p);
        }

        return Reflect.getOwnPropertyDescriptor(target, p);
    }

    public isExtensible(target: T): boolean {
        return false;
    }

    private mockSingleFunctionIfNecessary<F extends MockableFunction>(realFunction: F) {
        if (!this.cachedFunctionStub) {
            const mockedFunction: F = createMockedFunction();
            if (this.mockName !== null) {
                Reflect.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            CreateInternalMocker<F>(mockedFunction, realFunction, this.mockName, this.options, this.mockType);
            this.cachedFunctionStub = mockedFunction;
        }
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

        construct?(target: T, argArray: any, newTarget?: any): object {
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
function mock<T extends object>(clazz?: ClassConstructor<T> | string,
                                mockName?: string | null,
                                options: MockOptions = defaultOptions): T {
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

    const proxy = new Proxy<T>(stubFunction, new InvocationHandler<T>(clazz ? clazz.prototype : null, stubFunction, mockName, options, MockType.Full));
    if (createdMocks) {
        createdMocks.push(proxy);
    }
    return proxy;
}

function partialMock<T extends object>(realObject: T, options: MockOptions = defaultOptions) {
    return new Proxy(realObject, new InvocationHandler<T>(Object.getPrototypeOf(realObject), realObject, null, options, MockType.Partial));
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
    expect,
    setDefaultOptions,
    MockableFunction,
    InOrderExpectation,
    Answer,
    MockOptions,
    StrictnessMode,
    ClassConstructor,
};