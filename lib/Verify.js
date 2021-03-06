"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.reset = void 0;
const InternalMocker_1 = require("./InternalMocker");
function verify(...mocks) {
    for (const mock of mocks) {
        verifyMock(mock);
    }
}
exports.verify = verify;
function reset(...mocks) {
    for (const mock of mocks) {
        resetMock(mock);
    }
}
exports.reset = reset;
function resetMock(mock) {
    const internalMocker = InternalMocker_1.GetInternalMocker(mock);
    const test = Object.keys(mock);
    for (const key of test) {
        const value = mock[key];
        if (value) {
            const internalFunctionMocker = InternalMocker_1.GetInternalMockerSafe(value);
            if (internalFunctionMocker) {
                resetMock(value);
            }
        }
    }
    internalMocker.isInExpectation = false;
    clearArray(internalMocker.expectations);
    clearArray(internalMocker.inProgressInOrder);
    clearArray(internalMocker.recordedInvocations);
}
function clearArray(array) {
    while (array.length > 0) {
        array.shift();
    }
}
function verifyMock(mock) {
    const internalMocker = InternalMocker_1.GetInternalMocker(mock);
    const test = Reflect.ownKeys(mock);
    for (const key of test) {
        const value = Reflect.get(mock, key);
        if (value) {
            const internalFunctionMocker = InternalMocker_1.GetInternalMockerSafe(value);
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