"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const umbra_util_1 = require("@umbra-test/umbra-util");
exports.INTERNAL_MOCKER_NAME = umbra_util_1.INTERNAL_MOCKER_NAME;
function GetInternalMockerSafe(mock) {
    const internalMocker = mock[umbra_util_1.INTERNAL_MOCKER_NAME];
    return internalMocker !== null && internalMocker !== void 0 ? internalMocker : null;
}
exports.GetInternalMockerSafe = GetInternalMockerSafe;
function GetInternalMocker(mock) {
    const internalMocker = GetInternalMockerSafe(mock);
    if (internalMocker === null) {
        throw new Error(`Passed an object that was not a mock. Object: ${mock.toString()}`);
    }
    return internalMocker;
}
exports.GetInternalMocker = GetInternalMocker;
function CreateInternalMocker(mockedFunction, realFunction, mockName, options) {
    const internalMocker = {
        expectations: [],
        recordedInvocations: [],
        realFunction: realFunction,
        options: options,
        inProgressInOrder: [],
        isInExpectation: false,
        mockName: mockName !== null && mockName !== void 0 ? mockName : "mock"
    };
    mockedFunction[umbra_util_1.INTERNAL_MOCKER_NAME] = internalMocker;
    return internalMocker;
}
exports.CreateInternalMocker = CreateInternalMocker;
//# sourceMappingURL=InternalMocker.js.map