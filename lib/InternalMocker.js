"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INTERNAL_MOCKER_NAME = "__internalMocker";
exports.INTERNAL_MOCKER_NAME = INTERNAL_MOCKER_NAME;
function GetInternalMocker(mock) {
    const internalMocker = mock[INTERNAL_MOCKER_NAME];
    if (!internalMocker) {
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
        mockName: mockName
    };
    mockedFunction[INTERNAL_MOCKER_NAME] = internalMocker;
    return internalMocker;
}
exports.CreateInternalMocker = CreateInternalMocker;
//# sourceMappingURL=InternalMocker.js.map