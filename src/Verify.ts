import { GetInternalMocker, InternalMocker, INTERNAL_MOCKER_NAME } from "./InternalMocker";
import { ClassConstructor, MockableFunction } from "./Mock";
import { findBestArgumentMatcher } from "./MockedFunction";
import { normalizeMatcherArgs } from "./OnGoingStubs";

interface OnGoingVerification<F extends MockableFunction> {

    withArgs(...args: Parameters<F>): OnGoingVerification<F>;

    times(wantedNumberOfInvocations: number): OnGoingVerification<F>;

    atLeast(atLeastInvocations: number): OnGoingVerification<F>;

    once(): OnGoingVerification<F>;

    twice(): OnGoingVerification<F>;

    never(): OnGoingVerification<F>;

}

interface Verifier<F extends MockableFunction> {

    verify(args: Parameters<F>[]): void;
}

class FunctionVerifier<F extends MockableFunction> implements OnGoingVerification<F> {

    private readonly mock: F;
    private readonly internalMocker: InternalMocker<F>;
    private readonly inOrder: boolean;
    private expectedArgs: any[] | null;

    public constructor(mock: F, inOrder?: boolean) {
        this.mock = mock;
        this.internalMocker = GetInternalMocker(this.mock);
        this.expectedArgs = null;
        this.inOrder = inOrder || false;
    }

    public withArgs(...args: Parameters<F>): OnGoingVerification<F> {
        this.expectedArgs = args;
        return this;
    }

    public times(count: number): OnGoingVerification<F> {
        const actualValue = this.countNumberOfInvocations();
        if (count !== actualValue) {
            throw new Error(`Expected ${count} invocations, got ${actualValue}`);
        }

        return this;
    }

    public once(): OnGoingVerification<F> {
        return this.times(1);
    }

    public twice(): OnGoingVerification<F> {
        return this.times(2);
    }

    public atLeast(atLeastInvocations: number): OnGoingVerification<F> {
        const actualValue = this.countNumberOfInvocations();
        if (atLeastInvocations <= actualValue) {
            throw new Error(`Expected ${atLeastInvocations} invocations, got ${actualValue}`);
        }

        return this;
    }

    public never(): OnGoingVerification<F> {
        return this.times(0);
    }

    private countNumberOfInvocations(): number {
        if (this.expectedArgs === null) {
            return this.internalMocker.recordedInvocations.length;
        } else {
            let invocationCount = 0;
            for (const invocation of this.internalMocker.recordedInvocations) {
                const bestMatcher = findBestArgumentMatcher(this.expectedArgs, invocation);
                if (bestMatcher !== null) {
                    invocationCount++;
                }
            }

            return invocationCount;
        }
    }
}

function called<F extends MockableFunction>(mock: F): OnGoingVerification<F> {
    return new FunctionVerifier(mock);
}

function calledInOrder<F extends MockableFunction>(mock: F): OnGoingVerification<F> {
    return new FunctionVerifier(mock, true);
}

function verify<F extends MockableFunction>(mock: any): void {
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
                verify(value);
            }
        }
    }

    for (const expectation of internalMocker.expectations) {
        expectation.verify(internalMocker.recordedInvocations);
    }
}

export {
    verify,
    OnGoingVerification,
    Verifier,
};