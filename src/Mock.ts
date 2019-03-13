import { CreateInternalMocker, INTERNAL_MOCKER_NAME } from "./InternalMocker";
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
}

type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);

class InvocationHandler<T extends object> implements ProxyHandler<T> {

    private readonly cachedStubs: any = {};
    private readonly clazz: any | null | undefined;
    private readonly realObject: T;
    private readonly options: MockOptions;
    private cachedFunctionStub: any | null = null;

    constructor(clazz: any | null | undefined, realObject: T, options: MockOptions) {
        this.clazz = clazz;
        this.realObject = realObject;
        this.options = options;
    }

    public apply(target: T, thisArg: any, argArray?: any): any {
        if (target === this.realObject) {
            return this.cachedFunctionStub(...argArray);
        }

        (target as any)(argArray);
    }

    public get<F extends MockableFunction>(target: T, p: PropertyKey, receiver: any): any {
        if (p === INTERNAL_MOCKER_NAME) {
            // this will happen if we're mocking a single function
            if (!this.cachedFunctionStub) {
                const mockedFunction: F = createMockedFunction();
                const internalMocker = CreateInternalMocker<F>(mockedFunction, (target as any)[p], this.options);
                if (internalMocker.isInExpectation) {
                    internalMocker.isInExpectation = false;
                }
                this.cachedFunctionStub = mockedFunction;
            }

            return this.cachedFunctionStub[INTERNAL_MOCKER_NAME];
        }

        if (this.clazz) {
            const realMethod = this.clazz[p];
            if (!realMethod) {
                const validMethods = Object.getOwnPropertyNames(this.clazz).join(", ");
                throw new Error(`Method "${p.toString()}" was called on class "${this.clazz.constructor.name}". ` +
                    `Ensure method exists on prototype. Valid methods: [${validMethods}]`);
            }
        }
        if (!this.cachedStubs[p]) {
            const mockedFunction: F = createMockedFunction();
            Object.defineProperty(mockedFunction, "name", { value: p });
            const internalMocker = CreateInternalMocker<F>(mockedFunction, (target as any)[p], this.options);
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
};

function setDefaultOptions(options: Partial<MockOptions>) {
    defaultOptions = Object.assign(defaultOptions, options);
}

function mock<T>(object?: ClassConstructor<T>): T;
function mock<T extends object>(): T;
function mock<T extends object>(clazz?: ClassConstructor<T>, options: MockOptions = defaultOptions): T {
    // Passing a stub function here allows us to pass functions as well as objects to the proxy. This is because the
    // function is both an object and marked as [[Callable]]
    const stubFunction = (() => { /* intentionally blank */ }) as T;
    return new Proxy<T>(stubFunction, new InvocationHandler<T>(clazz ? clazz.prototype : null, stubFunction, options));
}

function spy<T extends object>(realObject: T, options: MockOptions = defaultOptions) {
    return new Proxy(realObject, new InvocationHandler<T>(Object.getPrototypeOf(realObject), realObject, options));
}

function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F> {
    return new OnGoingStubs(mockedFunction);
}

export {
    mock,
    spy,
    expect,
    setDefaultOptions,
    MockableFunction,
    Answer,
    MockOptions,
    StrictnessMode,
    ClassConstructor,
};