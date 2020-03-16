"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InternalMocker_1 = require("./InternalMocker");
function verify(...mocks) {
    for (const mock of mocks) {
        verifyMock(mock);
    }
}
exports.verify = verify;
function verifyMock(mock) {
    const internalMocker = InternalMocker_1.GetInternalMocker(mock);
    const test = Object.keys(mock);
    for (const key of test) {
        if (key === InternalMocker_1.INTERNAL_MOCKER_NAME) {
            continue;
        }
        const value = mock[key];
        if (value) {
            const internalFunctionMocker = InternalMocker_1.GetInternalMocker(value);
            if (internalFunctionMocker) {
                verifyMock(value);
            }
        }
    }
    for (const expectation of internalMocker.expectations) {
        if (!expectation.expectedRange.isInRange(expectation.callCount)) {
            throw new Error(buildErrorMessage(internalMocker.recordedInvocations, expectation));
        }
    }
}
function buildErrorMessage(args, expectationData) {
    const calledLocations = buildCallLocations(expectationData.expectedArgs, args);
    const specificMessage = buildRangeMessage(expectationData.expectedRange, expectationData.callCount);
    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
    return `${specificMessage}\nExpected at: ${expectationData.location}\n${callLocation}\n\u00A0`;
}
function buildRangeMessage(range, callCount) {
    return `Expected ${range.describeRange()}, got ${callCount}.`;
}
function buildCallLocations(expectedArgs, args) {
    const callLocations = [];
    for (const invocation of args) {
        if (expectedArgs === null) {
            if (invocation.location !== null) {
                callLocations.push(invocation.location);
            }
        }
    }
    return callLocations;
}
//# sourceMappingURL=Verify.js.map