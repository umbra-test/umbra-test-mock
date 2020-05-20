"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictnessMode = exports.setDefaultOptions = exports.expect = exports.staticMock = exports.partialMock = exports.mock = exports.inOrder = void 0;
const InternalMocker_1 = require("./InternalMocker");
const MockedFunction_1 = require("./MockedFunction");
const OnGoingStubs_1 = require("./OnGoingStubs");
const UmbraTestRunnerIntegration_1 = require("./UmbraTestRunnerIntegration");
const objectPrototype = Object.prototype;
var StrictnessMode;
(function (StrictnessMode) {
    StrictnessMode[StrictnessMode["Strict"] = 0] = "Strict";
    StrictnessMode[StrictnessMode["Loose"] = 1] = "Loose";
})(StrictnessMode || (StrictnessMode = {}));
exports.StrictnessMode = StrictnessMode;
class InvocationHandler {
    constructor(clazz, realObject, mockName, options, mockType) {
        this.cachedFields = {};
        this.cachedFunction = null;
        this.classPrototype = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;
    }
    apply(target, thisArg, argArray) {
        if (target === this.realObject) {
            this.mockSingleFunctionIfNecessary(this.realObject);
            return this.cachedFunction.apply(thisArg, argArray);
        }
        target(argArray);
    }
    construct(target, argArray, newTarget) {
        if (this.mockType === InternalMocker_1.MockType.Partial) {
            return partialMock(new target(...argArray));
        }
        return {};
    }
    get(target, p, receiver) {
        var _a;
        if (p === "prototype") {
            return Reflect.get(this.realObject, p);
        }
        if (p === InternalMocker_1.INTERNAL_MOCKER_NAME || Object.getPrototypeOf(Function)[p] !== undefined) {
            this.mockSingleFunctionIfNecessary(this.realObject);
            return this.cachedFunction[p];
        }
        const cachedField = this.cachedFields[p];
        if (cachedField !== null && cachedField !== undefined) {
            return cachedField;
        }
        let realValue = null;
        if (this.classPrototype || this.realObject) {
            const realValueDescriptor = (_a = this.getPropertyDescriptor(this.classPrototype, p)) !== null && _a !== void 0 ? _a : this.getPropertyDescriptor(this.realObject, p);
            if (realValueDescriptor === undefined) {
                if ((this.classPrototype && (this.mockType === InternalMocker_1.MockType.Instance || this.mockType === InternalMocker_1.MockType.Partial)) ||
                    (this.realObject && this.mockType === InternalMocker_1.MockType.Static || this.mockType === InternalMocker_1.MockType.Partial)) {
                    const validMethods = this.ownKeys(target).join(", ");
                    throw new Error(`Property "${p.toString()}" was access on class "${this.classPrototype.constructor.name}". ` +
                        `Ensure property exists on the prototype or existing object. Valid methods: [${validMethods}]`);
                }
            }
            else {
                realValue = realValueDescriptor.value;
                if (realValue === null || realValue === undefined) {
                    return realValue;
                }
            }
        }
        const realValueType = typeof realValue;
        if (realValueType === "number" || realValueType === "string" || realValueType === "boolean" || realValue instanceof Date ||
            realValue instanceof RegExp || Array.isArray(realValue)) {
            return realValue;
        }
        if (target instanceof Promise && p === "then") {
            realValue = realValue.bind(target);
        }
        let newCachedField;
        const mockName = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
        switch (this.mockType) {
            case InternalMocker_1.MockType.Instance:
                newCachedField = mock(realValue, mockName);
                break;
            case InternalMocker_1.MockType.Static:
            case InternalMocker_1.MockType.Partial:
                newCachedField = partialMock(realValue);
                break;
            default:
                throw new Error("Unknown mock type " + InternalMocker_1.MockType[this.mockType]);
        }
        this.cachedFields[p] = newCachedField;
        return newCachedField;
    }
    ownKeys(target) {
        const normalTargetKeys = Reflect.ownKeys(target);
        const cachedPrototypeKeys = Reflect.ownKeys(this.cachedFields);
        for (const key of normalTargetKeys) {
            if (key === InternalMocker_1.INTERNAL_MOCKER_NAME) {
                continue;
            }
            if (cachedPrototypeKeys.indexOf(key) === -1) {
                cachedPrototypeKeys.push(key);
            }
        }
        return cachedPrototypeKeys;
    }
    getOwnPropertyDescriptor(target, p) {
        if (this.cachedFields[p]) {
            return Object.getOwnPropertyDescriptor(this.cachedFields, p);
        }
        return Reflect.getOwnPropertyDescriptor(target, p);
    }
    mockSingleFunctionIfNecessary(realFunction) {
        if (!this.cachedFunction) {
            const mockedFunction = MockedFunction_1.createMockedFunction();
            if (this.mockName !== null) {
                Reflect.defineProperty(mockedFunction, "name", { value: this.mockName });
            }
            InternalMocker_1.CreateInternalMocker(mockedFunction, realFunction, this.mockName, this.options, this.mockType);
            this.cachedFunction = mockedFunction;
        }
    }
    getPropertyDescriptor(object, propertyKey) {
        if (!object) {
            return undefined;
        }
        let searchTarget = object;
        while (searchTarget !== objectPrototype) {
            const propertyDescriptor = Reflect.getOwnPropertyDescriptor(searchTarget, propertyKey);
            if (propertyDescriptor !== undefined) {
                return propertyDescriptor;
            }
            searchTarget = Reflect.getPrototypeOf(searchTarget);
        }
        return undefined;
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
    const proxy = new Proxy(stubFunction, new InvocationHandler(clazz ? clazz.prototype : null, stubFunction, mockName, options, InternalMocker_1.MockType.Instance));
    if (UmbraTestRunnerIntegration_1.createdMocks) {
        UmbraTestRunnerIntegration_1.createdMocks.push(proxy);
    }
    return proxy;
}
exports.mock = mock;
function staticMock(clazz) {
    const stubFunction = (() => { });
    return new Proxy(stubFunction, new InvocationHandler(clazz, stubFunction, null, defaultOptions, InternalMocker_1.MockType.Static));
}
exports.staticMock = staticMock;
function partialMock(realObject, mockName = null, options = defaultOptions) {
    return new Proxy(realObject, new InvocationHandler(Object.getPrototypeOf(realObject), realObject, mockName, options, InternalMocker_1.MockType.Partial));
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