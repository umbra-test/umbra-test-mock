import { ArgumentValidator, eq } from "./ArgumentValidator";
import { CountableVerifier } from "./CountableVerifier";
import { GetInternalMocker, InternalMocker, ExpectationData } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { StacktraceUtils } from "./StackTraceParser";
import { Verifier } from "./Verify";

type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;

interface OngoingStubbing<F extends MockableFunction> {

    withArgs(...args: Parameters<F>): OngoingStubbing<F>;

    andReturn(...values: ReturnType<F>[]): OngoingStubbing<F>;

    andStubReturn(...values: ReturnType<F>[]): void;

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

const CONSTRUCTOR_STACK_OFFSET = 1;
class OnGoingStubs<F extends MockableFunction> implements OngoingStubbing<F> {

    private readonly mockedFunction: F;
    private readonly internalMocker: InternalMocker<F>;
    private currentArgumentExpectations: ArgumentMatcher;
    private currentAnswer: Answer<F> | null;
    private expectation: ExpectationData<F>;

    constructor(mockedFunction: F) {
        this.mockedFunction = mockedFunction;
        this.internalMocker = GetInternalMocker(mockedFunction);
        this.currentArgumentExpectations = null;
        this.internalMocker.isInExpectation = true;
        this.currentAnswer = null;
        // Default to expecting 1
        this.expectation = this.internalTimes(1, CONSTRUCTOR_STACK_OFFSET);
    }

    public withArgs(...args: Parameters<F>): OnGoingStubs<F> {
        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        this.expectation.expectedArgs = this.currentArgumentExpectations;
        return this;
    }

    public andReturn(value: ReturnType<F>): OngoingStubbing<F> {
        this.setAnswerForAguments(createDirectReturnAnswer(value));
        return this;
    }

    public andStubReturn(value: ReturnType<F>): void {
        this.setAnswerForAguments(createDirectReturnAnswer(value));
        this.atLeast(0);
    }

    public andThrow(error: Error): OngoingStubbing<F> {
        this.setAnswerForAguments(createDirectThrowAnswer(error));
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

    public andAnswer(answer: Answer<ReturnType<F>>): OngoingStubbing<F> {
        this.setAnswerForAguments(answer);
        return this;
    }

    public andResolve(value: UnwrapPromise<ReturnType<F>>): OngoingStubbing<F> {
        this.setAnswerForAguments(createPromiseResolveAnswer(value));
        return this;
    }

    public andReject(error: Error): OngoingStubbing<F> {
        this.setAnswerForAguments(createPromiseRejectAnswer(error));
        return this;
    }

    public times(count: number): OngoingStubbing<F> {
        this.internalTimes(count);
        return this;
    }

    public once(): OngoingStubbing<F> {
        this.internalTimes(1);
        return this;
    }

    public twice(): OngoingStubbing<F> {
        this.internalTimes(2);
        return this;
    }

    public atLeast(atLeastInvocations: number): OngoingStubbing<F> {
        const location = StacktraceUtils.getCurrentMockLocation(4);
        const verifier = new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number, calledLocations: string[]) => {
                if (atLeastInvocations < actualValue) {
                    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
                    throw new Error(`Expected at least ${atLeastInvocations} invocations, got ${actualValue}.
Expected at: ${location}\n${callLocation}\n\u00A0`);
                }
        });
        this.addExpectation(verifier, location);
        return this;
    }

    public never(): OngoingStubbing<F> {
        this.internalTimes(0);
        return this;
    }

    // Required to set stack trace correctly
    private internalTimes(count: number, stackOffset: number = 0): ExpectationData<F> {
        const location = StacktraceUtils.getCurrentMockLocation(3 + stackOffset);
        const verifier = new CountableVerifier(this.currentArgumentExpectations,
            (actualValue: number, calledLocations: string[]) => {
                if (count !== actualValue) {
                    const callLocation = calledLocations.length > 0 ? "Called at:\n" + calledLocations.join("\n") : "";
                    throw new Error(`Expected ${count} invocations, got ${actualValue}.
Expected at: ${location}\n${callLocation}\n\u00A0`);
                }
        });
        return this.addExpectation(verifier, location);
    }

    private addExpectation(verifier: Verifier<F>, location: string | null): ExpectationData<F>  {
        if (this.expectation) {
            this.expectation.verifier = verifier;
            this.expectation.location = location;
            return this.expectation;
        } else {
            const expectation: ExpectationData<F> = {
                verifier: verifier,
                location: location,
                answer: this.currentAnswer,
                expectedArgs: this.currentArgumentExpectations,
                callCount: 0
            };
            this.internalMocker.expectations.push(expectation);
            this.expectation = expectation;
            return expectation;
        }
    }

    private setAnswerForAguments(answer: Answer<F>): void {
        this.currentAnswer = answer;
        this.expectation.answer = answer;
    }
}

export { OnGoingStubs, OngoingStubbing, normalizeMatcherArgs, };
