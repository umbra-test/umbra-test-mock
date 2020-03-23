"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictnessMode = exports.setDefaultOptions = exports.expect = exports.partialMock = exports.mock = exports.inOrder = void 0;
const InternalMocker_1 = require("./InternalMocker");
const MockedFunction_1 = require("./MockedFunction");
const OnGoingStubs_1 = require("./OnGoingStubs");
const UmbraTestRunnerIntegration_1 = require("./UmbraTestRunnerIntegration");
var StrictnessMode;
(function (StrictnessMode) {
    StrictnessMode[StrictnessMode["Strict"] = 0] = "Strict";
    StrictnessMode[StrictnessMode["Loose"] = 1] = "Loose";
})(StrictnessMode || (StrictnessMode = {}));
exports.StrictnessMode = StrictnessMode;
class InvocationHandler {
    constructor(clazz, realObject, mockName, options, mockType) {
        this.cachedPrototypeStubs = {};
        this.cachedStaticStubs = {};
        this.cachedFunctionStub = null;
        this.clazz = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;
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
        let targetCache;
        if (this.clazz) {
            const realPrototypeMethod = this.clazz[p];
            if (realPrototypeMethod === null || realPrototypeMethod === undefined) {
                const realStaticMethod = this.realObject[p];
                if (realStaticMethod !== null && realStaticMethod !== undefined) {
                    if (this.realObject) {
                        targetCache = this.cachedStaticStubs;
                    }
                }
                else {
                    const validMethods = Object.getOwnPropertyNames(this.clazz).join(", ");
                    throw new Error(`Method "${p.toString()}" was called on class "${this.clazz.constructor.name}". ` +
                        `Ensure method exists on prototype. Valid methods: [${validMethods}]`);
                }
            }
            else {
                targetCache = this.cachedPrototypeStubs;
            }
        }
        else {
            targetCache = this.cachedStaticStubs;
        }
        if (!targetCache[p]) {
            const mockedFunction = MockedFunction_1.createMockedFunction();
            const mockName = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
            Object.defineProperty(mockedFunction, "name", { value: mockName });
            InternalMocker_1.CreateInternalMocker(mockedFunction, target[p], mockName, this.options, this.mockType);
            targetCache[p] = mockedFunction;
        }
        return targetCache[p];
    }
    ownKeys(target) {
        const normalTargetKeys = Reflect.ownKeys(target);
        const cachedPrototypeKeys = Reflect.ownKeys(this.cachedPrototypeStubs);
        for (const key of normalTargetKeys) {
            if (cachedPrototypeKeys.indexOf(key) === -1) {
                cachedPrototypeKeys.push(key);
            }
        }
        return cachedPrototypeKeys;
    }
    getOwnPropertyDescriptor(target, p) {
        if (this.cachedPrototypeStubs[p]) {
            return Object.getOwnPropertyDescriptor(this.cachedPrototypeStubs, p);
        }
        return Reflect.getOwnPropertyDescriptor(target, p);
    }
    isExtensible(target) {
        return false;
    }
    mockSingleFunctionIfNecessary(realFunction) {
        if (!this.cachedFunctionStub) {
            const mockedFunction = MockedFunction_1.createMockedFunction();
            if (this.mockName !== null) {
                Reflect.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            InternalMocker_1.CreateInternalMocker(mockedFunction, realFunction, this.mockName, this.options, this.mockType);
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
    const proxy = new Proxy(stubFunction, new InvocationHandler(clazz ? clazz.prototype : null, stubFunction, mockName, options, InternalMocker_1.MockType.Full));
    if (UmbraTestRunnerIntegration_1.createdMocks) {
        UmbraTestRunnerIntegration_1.createdMocks.push(proxy);
    }
    return proxy;
}
exports.mock = mock;
function partialMock(realObject, options = defaultOptions) {
    return new Proxy(realObject, new InvocationHandler(Object.getPrototypeOf(realObject), realObject, null, options, InternalMocker_1.MockType.Partial));
}
exports.partialMock = partialMock;
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
    for (const castStub of castStubs) {
        const expectation = castStub.getExpectation();
        inOrderExpectation.expectations.push(expectation);
        expectation.inOrderOverride = inOrderExpectation;
    }
}
exports.inOrder = inOrder;
//# sourceMappingURL=Mock.js.map