import {
    ExpectationData,
    GetInternalMocker,
    INTERNAL_MOCKER_NAME,
    InternalMocker,
    RecordedInvocation
} from "./InternalMocker";
import { MockableFunction } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { Range } from "./Range";

function verify(...mocks: any[]): void {
    for (const mock of mocks) {
        verifyMock(mock);
    }
}

function verifyMock<F extends MockableFunction>(mock: any) {
    const internalMocker: InternalMocker<F> = GetInternalMocker(mock);

    const test = Object.keys(mock);
    for (const key of test) {
        if (key === INTERNAL_MOCKER_NAME) {
            continue;
        }
        const value = mock[key];
        if (value) {
            const internalFunctionMocker = GetInternalMocker(value);
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

function buildErrorMessage<F extends MockableFunction>(args: RecordedInvocation<F>[],
                                                       expectationData: ExpectationData<F>): string {
    const calledLocations = buildCallLocations(expectationData.expectedArgs, args);
    const specificMessage = buildRangeMessage(expectationData.expectedRange, expectationData.callCount);
    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
    return `${specificMessage}\nExpected at: ${expectationData.location}\n${callLocation}\n\u00A0`;
}

function buildRangeMessage(range: Range, callCount: number): string {
    return `Expected ${range.describeRange()}, got ${callCount}.`;
}

function buildCallLocations<F extends MockableFunction>(expectedArgs: ArgumentMatcher,
                                                        args: RecordedInvocation<F>[]): string[] {
    const callLocations: string[] = [];
    for (const invocation of args) {
        if (expectedArgs === null) {
            if (invocation.location !== null) {
                callLocations.push(invocation.location);
            }
        }
    }
    return callLocations;
}

export {
    verify
};