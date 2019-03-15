import {
    ExpectationData,
    GetInternalMocker,
    INTERNAL_MOCKER_NAME,
    InternalMocker,
    RecordedInvocation
} from "./InternalMocker";
import { MockableFunction } from "./Mock";

interface OnGoingVerification<F extends MockableFunction> {

    withArgs(...args: Parameters<F>): OnGoingVerification<F>;

    times(wantedNumberOfInvocations: number): OnGoingVerification<F>;

    atLeast(atLeastInvocations: number): OnGoingVerification<F>;

    once(): OnGoingVerification<F>;

    twice(): OnGoingVerification<F>;

    never(): OnGoingVerification<F>;

}

interface Verifier<F extends MockableFunction> {

    verify(args: RecordedInvocation<F>[], expectationData: ExpectationData<F>): void;
}

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
        expectation.verifier.verify(internalMocker.recordedInvocations, expectation);
    }
}

export {
    verify,
    OnGoingVerification,
    Verifier,
};