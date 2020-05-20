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
    constructor(clazz, mockedFunction, realObject, mockName, options, mockType) {
        this.classPrototype = clazz;
        this.realObject = realObject;
        this.mockName = mockName;
        this.options = options;
        this.mockType = mockType;
        if (this.mockName !== null) {
            Reflect.defineProperty(realObject, "name", { value: this.mockName });
        }
        this.internalMocker = InternalMocker_1.CreateInternalMocker(mockedFunction, realObject, this.mockName, this.options, this.mockType);
    }
    apply(target, thisArg, argArray) {
        return target.apply(thisArg, argArray);
    }
    construct(target, argArray, newTarget) {
        if (this.mockType === InternalMocker_1.MockType.Partial) {
            return partialMock(new this.realObject(...argArray));
        }
        return {};
    }
    get(target, p, receiver) {
        if (p === InternalMocker_1.INTERNAL_MOCKER_NAME) {
            return this.internalMocker;
        }
        let realValue = Reflect.get(this.realObject, p, receiver);
        if (realValue !== undefined) {
            if (typeof realValue !== "function" || this.mockType !== InternalMocker_1.MockType.Partial || InternalMocker_1.GetInternalMockerSafe(realValue) !== null) {
                return realValue;
            }
        }
        if (this.classPrototype && realValue === undefined) {
            const propertyDescriptor = this.getPropertyDescriptor(this.classPrototype, p);
            if (propertyDescriptor !== undefined) {
                realValue = propertyDescriptor.value;
            }
            else if (this.mockType === InternalMocker_1.MockType.Instance) {
                return undefined;
            }
        }
        if (this.realObject instanceof Promise && p === "then") {
            realValue = realValue.bind(this.realObject);
        }
        let newCachedField;
        const mockName = this.mockName !== null ? `${this.mockName}.${p.toString()}` : p.toString();
        switch (this.mockType) {
            case InternalMocker_1.MockType.Instance:
                newCachedField = mock(realValue, mockName);
                break;
            case InternalMocker_1.MockType.Static:
            case InternalMocker_1.MockType.Partial:
                if (!realValue) {
                    return realValue;
                }
                newCachedField = partialMock(realValue);
                break;
            default:
                throw new Error("Unknown mock type " + InternalMocker_1.MockType[this.mockType]);
        }
        Reflect.set(this.realObject, p, newCachedField);
        return newCachedField;
    }
    deleteProperty(target, p) {
        return Reflect.deleteProperty(this.realObject, p);
    }
    set(target, p, value, receiver) {
        return Reflect.set(this.realObject, p, value, receiver);
    }
    ownKeys(target) {
        let normalTargetKeys = Reflect.ownKeys(target);
        if (this.mockType === InternalMocker_1.MockType.Static) {
            normalTargetKeys = normalTargetKeys.concat(Reflect.ownKeys(this.classPrototype));
        }
        const resultKeys = Reflect.ownKeys(this.realObject);
        const internalMockIndex = resultKeys.indexOf(InternalMocker_1.INTERNAL_MOCKER_NAME);
        if (internalMockIndex !== -1) {
            resultKeys.splice(internalMockIndex, 1);
        }
        for (const key of normalTargetKeys) {
            if (key === InternalMocker_1.INTERNAL_MOCKER_NAME) {
                continue;
            }
            if (resultKeys.indexOf(key) === -1) {
                resultKeys.push(key);
            }
        }
        return resultKeys;
    }
    getOwnPropertyDescriptor(target, p) {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, p);
        if (descriptor !== undefined) {
            return descriptor;
        }
        return Reflect.getOwnPropertyDescriptor(this.realObject, p);
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
    const stubFunction = MockedFunction_1.createMockedFunction();
    if (typeof clazz === "string") {
        mockName = clazz;
        clazz = undefined;
    }
    if (!mockName) {
        mockName = null;
    }
    const proxy = new Proxy(stubFunction, new InvocationHandler(clazz ? clazz.prototype : null, stubFunction, stubFunction, mockName, options, InternalMocker_1.MockType.Instance));
    if (UmbraTestRunnerIntegration_1.createdMocks) {
        UmbraTestRunnerIntegration_1.createdMocks.push(proxy);
    }
    return proxy;
}
exports.mock = mock;
function staticMock(clazz) {
    const stubFunction = MockedFunction_1.createMockedFunction();
    return new Proxy(stubFunction, new InvocationHandler(clazz, stubFunction, stubFunction, null, defaultOptions, InternalMocker_1.MockType.Static));
}
exports.staticMock = staticMock;
function partialMock(realObject, mockName = null, options = defaultOptions) {
    const stubFunction = (typeof realObject === "function" ? MockedFunction_1.createMockedFunction() : {});
    return new Proxy(stubFunction, new InvocationHandler(Object.getPrototypeOf(realObject), stubFunction, realObject, mockName, options, InternalMocker_1.MockType.Partial));
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