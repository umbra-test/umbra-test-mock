import { CreateInternalMocker, ExpectationData, INTERNAL_MOCKER_NAME } from "./InternalMocker";
import { createMockedFunction } from "./MockedFunction";
import { OngoingStubbing, OnGoingStubs } from "./OnGoingStubs";

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

    private readonly cachedStubs: any = {};
    private readonly clazz: any | null | undefined;
    private readonly realObject: T;
    private readonly mockName: string | null;
    private readonly options: MockOptions;
    private cachedFunctionStub: any | null = null;

    constructor(clazz: any | null | undefined, realObject: T, mockName: string | null, options: MockOptions) {
        this.clazz = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
    }

    public apply(target: T, thisArg: any, argArray?: any): any {
        if (target === this.realObject) {
            this.mockSingleFunctionIfNecessary(this.realObject as any);
            return this.cachedFunctionStub(...argArray);
        }

        (target as any)(argArray);
    }

    public get<F extends MockableFunction>(target: T, p: PropertyKey, receiver: any): any {
        if (p === INTERNAL_MOCKER_NAME) {
            // this will happen if we're mocking a single function
            this.mockSingleFunctionIfNecessary<F>((target as any)[p]);

            return this.cachedFunctionStub[INTERNAL_MOCKER_NAME];
        }

        if (this.clazz) {
            const realMethod = this.clazz[p];
            if (realMethod === null || realMethod === undefined) {
                const validMethods = Object.getOwnPropertyNames(this.clazz).join(", ");
                throw new Error(`Method "${p.toString()}" was called on class "${this.clazz.constructor.name}". ` +
                    `Ensure method exists on prototype. Valid methods: [${validMethods}]`);
            }
        }
        if (!this.cachedStubs[p]) {
            const mockedFunction: F = createMockedFunction();
            const mockName: string = this.mockName !== null ? this.mockName : p.toString();
            Object.defineProperty(mockedFunction, "name", { value: mockName });
            const internalMocker = CreateInternalMocker<F>(mockedFunction, (target as any)[p], mockName, this.options);
            if (internalMocker.isInExpectation) {
                internalMocker.isInExpectation = false;
            }
            this.cachedStubs[p] = mockedFunction;
        }

        return this.cachedStubs[p];
    }

    public enumerate(target: T): PropertyKey[] {
        return this.ownKeys(target);
    }

    public ownKeys(target: T): PropertyKey[] {
        const test2 = Object.keys(this.cachedStubs);
        return test2;
    }

    public getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
        return Object.getOwnPropertyDescriptor(this.cachedStubs, p);
    }

    public isExtensible(target: T): boolean {
        return false;
    }

    private mockSingleFunctionIfNecessary<F extends MockableFunction>(realFunction: F) {
        if (!this.cachedFunctionStub) {
            const mockedFunction: F = createMockedFunction();
            if (this.mockName !== null) {
                Object.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            const internalMocker = CreateInternalMocker<F>(mockedFunction, realFunction, this.mockName, this.options);
            if (internalMocker.isInExpectation) {
                internalMocker.isInExpectation = false;
            }

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
                                options: MockOptions = defaultOptions): T
{
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

    return new Proxy<T>(stubFunction,
        new InvocationHandler<T>(clazz ? clazz.prototype : null, stubFunction, mockName, options));
}

function spy<T extends object>(realObject: T, options: MockOptions = defaultOptions) {
    return new Proxy(realObject,
        new InvocationHandler<T>(Object.getPrototypeOf(realObject), realObject, null, options));
}

function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F> {
    return new OnGoingStubs(mockedFunction);
}

interface InOrderExpectation {
    expectations: ExpectationData<any>[];
    currentIndex: number;
}

function inOrder(...stubs: OngoingStubbing<any>[]) {
    const inOrderExpectation: InOrderExpectation = {
        expectations: [],
        currentIndex : 0
    };
    const castStubs = stubs as OnGoingStubs<any>[];
    for (const stub of castStubs) {
        const expectation: ExpectationData<any> = stub.getExpectation();
        inOrderExpectation.expectations.push(expectation);
        expectation.inOrderOverride = inOrderExpectation;
    }
}

export {
    inOrder,
    mock,
    spy,
    expect,
    setDefaultOptions,
    MockableFunction,
    InOrderExpectation,
    Answer,
    MockOptions,
    StrictnessMode,
    ClassConstructor,
};