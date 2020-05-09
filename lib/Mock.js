"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InternalMocker_1 = require("./InternalMocker");
const MockedFunction_1 = require("./MockedFunction");
const OnGoingStubs_1 = require("./OnGoingStubs");
var StrictnessMode;
(function (StrictnessMode) {
    StrictnessMode[StrictnessMode["Strict"] = 0] = "Strict";
    StrictnessMode[StrictnessMode["Loose"] = 1] = "Loose";
})(StrictnessMode || (StrictnessMode = {}));
exports.StrictnessMode = StrictnessMode;
class InvocationHandler {
    constructor(clazz, realObject, mockName, options) {
        this.cachedStubs = {};
        this.cachedFunctionStub = null;
        this.clazz = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
    }
    apply(target, thisArg, argArray) {
        if (target === this.realObject) {
            this.mockSingleFunctionIfNecessary(this.realObject);
            return this.cachedFunctionStub(...argArray);
        }
        target(argArray);
    }
    get(target, p, receiver) {
        if (p === InternalMocker_1.INTERNAL_MOCKER_NAME || Object.getPrototypeOf(Function)[p] !== undefined) {
            this.mockSingleFunctionIfNecessary(target[p]);
            return this.cachedFunctionStub[p];
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
            const mockedFunction = MockedFunction_1.createMockedFunction();
            const mockName = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
            Object.defineProperty(mockedFunction, "name", { value: mockName });
            const internalMocker = InternalMocker_1.CreateInternalMocker(mockedFunction, target[p], mockName, this.options);
            if (internalMocker.isInExpectation) {
                internalMocker.isInExpectation = false;
            }
            this.cachedStubs[p] = mockedFunction;
        }
        return this.cachedStubs[p];
    }
    enumerate(target) {
        return this.ownKeys(target);
    }
    ownKeys(target) {
        const test2 = Object.keys(this.cachedStubs);
        return test2;
    }
    getOwnPropertyDescriptor(target, p) {
        return Object.getOwnPropertyDescriptor(this.cachedStubs, p);
    }
    isExtensible(target) {
        return false;
    }
    mockSingleFunctionIfNecessary(realFunction) {
        if (!this.cachedFunctionStub) {
            const mockedFunction = MockedFunction_1.createMockedFunction();
            if (this.mockName !== null) {
                Object.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            const internalMocker = InternalMocker_1.CreateInternalMocker(mockedFunction, realFunction, this.mockName, this.options);
            if (internalMocker.isInExpectation) {
                internalMocker.isInExpectation = false;
            }
            this.cachedFunctionStub = mockedFunction;
        }
    }
}
let defaultOptions = {
    strictMode: StrictnessMode.Strict,
    inOrder: false
};
function setDefaultOptions(options) {
    defaultOptions = Object.assign(defaultOptions, options);
}
exports.setDefaultOptions = setDefaultOptions;
function mock(clazz, mockName, options = defaultOptions) {
    const stubFunction = (() => { });
    if (typeof clazz === "string") {
        mockName = clazz;
        clazz = undefined;
    }
    if (!mockName) {
        mockName = null;
    }
    return new Proxy(stubFunction, new InvocationHandler(clazz ? clazz.prototype : null, stubFunction, mockName, options));
}
exports.mock = mock;
function spy(realObject, options = defaultOptions) {
    return new Proxy(realObject, new InvocationHandler(Object.getPrototypeOf(realObject), realObject, null, options));
}
exports.spy = spy;
function expect(mockedFunction) {
    return new OnGoingStubs_1.OnGoingStubs(mockedFunction);
}
exports.expect = expect;
function inOrder(...stubs) {
    const inOrderExpectation = {
        expectations: [],
        currentIndex: 0
    };
    const castStubs = stubs;
    for (const stub of castStubs) {
        const expectation = stub.getExpectation();
        inOrderExpectation.expectations.push(expectation);
        expectation.inOrderOverride = inOrderExpectation;
    }
}
exports.inOrder = inOrder;
//# sourceMappingURL=Mock.js.map