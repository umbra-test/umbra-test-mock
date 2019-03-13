import { ArgumentValidator, eq } from "./ArgumentValidator";
import { CountableVerifier } from "./CountableVerifier";
import { GetInternalMocker, InternalMocker, StubData } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { StacktraceUtils } from "./StackTraceParser";

type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;

interface OngoingStubbing<F extends MockableFunction> {

    inOrder(): OngoingStubbing<F>;

    withArgs(...args: Parameters<F>): OngoingStubbing<F>;

    andReturn(...values: ReturnType<F>[]): OngoingStubbing<F>;

    andThrow(...error: Error[]): OngoingStubbing<F>;

    andResolve(...values: UnwrapPromise<ReturnType<F>>[]): OngoingStubbing<F>;

    andReject(...values: Error[]): OngoingStubbing<F>;

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

function createPromiseResolveAnswer<F extends MockableFunction>(value: UnwrapPromise<ReturnType<F>>): Answer<F> {
    return function directReturnAnswer(): ReturnType<F> {
        // Casting because I can't get the unwrapping and rewrapping of promises to correctly type. The public interface
        // typing is correct and will error if any non promise return types try to use .andResolve
        return Promise.resolve(value) as ReturnType<F>;
    };
}

function createPromiseRejectAnswer<F extends MockableFunction>(error: Error): Answer<F> {
    return function directReturnAnswer(): ReturnType<F> {
        // Casting because I can't get the unwrapping and rewrapping of promises to correctly type. The public interface
        // typing is correct and will error if any non promise return types try to use .andReject
        return Promise.reject(error) as ReturnType<F>;
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

const CONSTRUCTOR_STACK_OFFSET = 1;
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
        this.internalTimes(1, CONSTRUCTOR_STACK_OFFSET);
    }

    public inOrder(): OnGoingStubs<F> {
        this.verifyInOrder = true;
        return this;
    }

    public withArgs(...args: Parameters<F>): OnGoingStubs<F> {
        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        // tslint:disable-next-line: no-bitwise
        this.state = StubbingState.HasArgs | this.state;
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

    public andResolve(...values: UnwrapPromise<ReturnType<F>>[]): OngoingStubbing<F> {
        for (const value of values) {
            this.setAnswerForAguments(createPromiseResolveAnswer(value));
        }
        return this;
    }

    public andReject(...errors: Error[]): OngoingStubbing<F> {
        for (const error of errors) {
            this.setAnswerForAguments(createPromiseRejectAnswer(error));
        }
        return this;
    }

    public times(count: number): OngoingStubbing<F> {
        return this.internalTimes(count);
    }

    public once(): OngoingStubbing<F> {
        return this.internalTimes(1);
    }

    public twice(): OngoingStubbing<F> {
        return this.internalTimes(2);
    }

    public atLeast(atLeastInvocations: number): OngoingStubbing<F> {
        const location = StacktraceUtils.getCurrentMockLocation(4);
        const verifier = new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number, calledLocations: string[]) => {
                if (atLeastInvocations <= actualValue) {
                    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
                    throw new Error(`Expected at least ${atLeastInvocations} invocations, got ${actualValue}.
Expected at: ${location}\n${callLocation}\n\u00A0`);
                }
        });
        this.internalMocker.expectations.push({
            verifier: verifier,
            location: location
        });

        return this;
    }

    public never(): OngoingStubbing<F> {
        this.resetExpectations();
        return this.internalTimes(0);
    }

    // Required to set stack trace correctly
    private internalTimes(count: number, stackOffset: number = 0) {
        const location = StacktraceUtils.getCurrentMockLocation(3 + stackOffset);
        const verifier = new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number, calledLocations: string[]) => {
                if (count !== actualValue) {
                    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
                    throw new Error(`Expected ${count} invocations, got ${actualValue}.
Expected at: ${location}\n${callLocation}\n\u00A0`);
                }
        });
        this.resetExpectations();
        this.internalMocker.expectations.push({
            verifier: verifier,
            location: location
        });

        return this;
    }

    private setAnswerForAguments(answer: Answer<F>): void {
        let data: StubData<F> | undefined = this.internalMocker.stubs.get(this.currentArgumentExpectations);
        if (data === undefined) {
            data = {
                answers: [],
                location: StacktraceUtils.getCurrentMockLocation(3)
            };
            this.internalMocker.stubs.set(this.currentArgumentExpectations, data);
        }
        data.answers.push(answer);
    }

    private resetExpectations() {
        while (this.internalMocker.expectations.length > 0) {
            this.internalMocker.expectations.pop();
        }
    }
}

export { OnGoingStubs, OngoingStubbing, normalizeMatcherArgs, };
