import { ArgumentValidator, eq } from "./ArgumentValidator";
import { GetInternalMocker, InternalMocker } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
import { CountableVerifier } from "./CountableVerifier";
import { ArgumentMatcher } from "./MockedFunction";

interface OngoingStubbing<F extends MockableFunction> {

    inOrder(): OngoingStubbing<F>;

    withArgs(...args: Parameters<F>): OngoingStubbing<F>;

    andReturn(...values: ReturnType<F>[]): OngoingStubbing<F>;

    andThrow(...error: Error[]): OngoingStubbing<F>;

    andCallRealMethod(): OngoingStubbing<F>;

    andAnswer(answer: Answer<F>): OngoingStubbing<F>;

    times(wantedNumberOfInvocations: number): OngoingStubbing<F>;

    atLeast(atLeastInvocations: number): OngoingStubbing<F>;

    once(): OngoingStubbing<F>;

    twice(): OngoingStubbing<F>;

    never(): OngoingStubbing<F>;

}

function createDirectReturnAnswer<F extends MockableFunction>(value: ReturnType<F>): Answer<F> {
    return function directReturnAnswer(): ReturnType<F> {
        return value;
    };
}

function createDirectThrowAnswer<F extends MockableFunction>(error: Error): Answer<F> {
    return function directThrowAnswer(): ReturnType<F> {
        throw error;
    };
}

function createCallRealMethodAnwser<F extends MockableFunction>(realFunction: F): Answer<F> {
    return function realMethodAnswer(...args: Parameters<F>) {
        return realFunction(args);
    };
}

function normalizeMatcherArgs<F extends MockableFunction>(args: Parameters<F>): ArgumentValidator<any>[] {
    const normalizedArgs: Parameters<F> = [] as any;
    for (const arg of args) {
        const argMatcher: any = typeof arg.matches === "function" ? arg : eq(arg);
        normalizedArgs.push(argMatcher);
    }
    return normalizedArgs;
}

enum StubbingState {
    NoInfo = 0,
    HasArgs = 1,
    HasReturnValue = 2,
    HasCount = 4,
}

class OnGoingStubs<F extends MockableFunction> implements OngoingStubbing<F> {

    private readonly mockedFunction: F;
    private readonly internalMocker: InternalMocker<F>;
    private currentArgumentExpectations: ArgumentMatcher;
    private state: StubbingState;
    private verifyInOrder: boolean;

    constructor(mockedFunction: F) {
        this.mockedFunction = mockedFunction;
        this.internalMocker = GetInternalMocker(mockedFunction);
        this.currentArgumentExpectations = null;
        this.internalMocker.isInExpectation = true;
        this.state = StubbingState.NoInfo;
        this.verifyInOrder = false;
        // Default to expecting 1
        this.times(1);
    }

    public inOrder(): OnGoingStubs<F> {
        this.verifyInOrder = true;
        return this;
    }

    public withArgs(...args: Parameters<F>): OnGoingStubs<F> {
        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        // tslint:disable-next-line: no-bitwise
        this.state = StubbingState.HasArgs | this.state;
        this.updateState();
        return this;
    }

    public andReturn(...values: ReturnType<F>[]): OngoingStubbing<F> {
        for (const value of values) {
            this.setAnswerForAguments(createDirectReturnAnswer(value));
        }
        return this;
    }

    public andThrow(...errors: Error[]): OngoingStubbing<F> {
        for (const error of errors) {
            this.setAnswerForAguments(createDirectThrowAnswer(error));
        }
        return this;
    }

    public andCallRealMethod(): OngoingStubbing<F> {
        const realFunction = this.internalMocker.realFunction;
        if (!realFunction) {
            throw new Error("No function was available. Ensure a real object was passed to the spy");
        }
        this.setAnswerForAguments(createCallRealMethodAnwser(realFunction));
        return this;
    }

    public andAnswer(...answers: Answer<ReturnType<F>>[]): OngoingStubbing<F> {
        for (const answer of answers) {
            this.setAnswerForAguments(answer);
        }
        return this;
    }

    public times(count: number): OngoingStubbing<F> {
        this.internalMocker.expectations.push(new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number) => {
                if (count !== actualValue) {
                    throw new Error(`Expected ${count} invocations, got ${actualValue}`);
                }
        }));

        return this;
    }

    public once(): OngoingStubbing<F> {
        return this.times(1);
    }

    public twice(): OngoingStubbing<F> {
        return this.times(2);
    }

    public atLeast(atLeastInvocations: number): OngoingStubbing<F> {
        this.internalMocker.expectations.push(new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number) => {
                if (atLeastInvocations <= actualValue) {
                    throw new Error(`Expected at least ${atLeastInvocations} invocations, got ${actualValue}`);
                }
        }));

        return this;
    }

    public never(): OngoingStubbing<F> {
        // Reset expectations
        this.internalMocker.expectations.pop();
        return this.times(0);
    }

    private setAnswerForAguments(answer: Answer<F>) {
        let data = this.internalMocker.stubs.get(this.currentArgumentExpectations);
        if (!data) {
            data = [];
            this.internalMocker.stubs.set(this.currentArgumentExpectations, data);
        }
        data.push(answer);
    }

    private updateState() {

    }
}

export {
    OnGoingStubs,
    OngoingStubbing,
    normalizeMatcherArgs,
};