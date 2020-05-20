"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockType = exports.INTERNAL_MOCKER_NAME = exports.createInvalidMockError = exports.GetInternalMockerSafe = exports.GetInternalMocker = exports.CreateInternalMocker = void 0;
const umbra_util_1 = require("@umbra-test/umbra-util");
Object.defineProperty(exports, "INTERNAL_MOCKER_NAME", { enumerable: true, get: function () { return umbra_util_1.INTERNAL_MOCKER_NAME; } });
var MockType;
(function (MockType) {
    MockType[MockType["Instance"] = 0] = "Instance";
    MockType[MockType["Static"] = 1] = "Static";
    MockType[MockType["Partial"] = 2] = "Partial";
})(MockType || (MockType = {}));
exports.MockType = MockType;
function GetInternalMockerSafe(mock) {
    if (mock === null || mock === undefined) {
        return null;
    }
    const internalMocker = mock[umbra_util_1.INTERNAL_MOCKER_NAME];
    return internalMocker !== null && internalMocker !== void 0 ? internalMocker : null;
}
exports.GetInternalMockerSafe = GetInternalMockerSafe;
function GetInternalMocker(mock) {
    const internalMocker = GetInternalMockerSafe(mock);
    if (internalMocker === null) {
        throw createInvalidMockError(mock);
    }
    return internalMocker;
}
exports.GetInternalMocker = GetInternalMocker;
function createInvalidMockError(object) {
    return new Error(`Passed an object that was not a mock. Object provided: ${umbra_util_1.printObject(object)}`);
}
exports.createInvalidMockError = createInvalidMockError;
function CreateInternalMocker(mockedFunction, realFunction, mockName, options, mockType) {
    const internalMocker = {
        expectations: [],
        recordedInvocations: [],
        realFunction: realFunction,
        options: options,
        inProgressInOrder: [],
        isInExpectation: false,
        mockName: mockName !== null && mockName !== void 0 ? mockName : "mock",
        mockType: mockType
    };
    mockedFunction[umbra_util_1.INTERNAL_MOCKER_NAME] = internalMocker;
    return internalMocker;
}
exports.CreateInternalMocker = CreateInternalMocker;
//# sourceMappingURL=InternalMocker.js.map