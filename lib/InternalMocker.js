"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockType = exports.INTERNAL_MOCKER_NAME = exports.GetInternalMockerSafe = exports.GetInternalMocker = exports.CreateInternalMocker = void 0;
const umbra_util_1 = require("@umbra-test/umbra-util");
Object.defineProperty(exports, "INTERNAL_MOCKER_NAME", { enumerable: true, get: function () { return umbra_util_1.INTERNAL_MOCKER_NAME; } });
var MockType;
(function (MockType) {
    MockType[MockType["Full"] = 0] = "Full";
    MockType[MockType["Partial"] = 1] = "Partial";
})(MockType || (MockType = {}));
exports.MockType = MockType;
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