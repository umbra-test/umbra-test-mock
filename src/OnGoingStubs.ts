import { ArgumentValidator, eq } from "./ArgumentValidator";
import { ExpectationData, GetInternalMocker, InternalMocker } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { Range } from "./Range";
import { StacktraceUtils } from "./StackTraceParser";

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

const NOT_SET = -1;
class OnGoingStubs<F extends MockableFunction> implements OngoingStubbing<F> {

    public readonly internalMocker: InternalMocker<F>;
    private currentArgumentExpectations: ArgumentMatcher;
    private expectation: ExpectationData<F>;
    private atMostCount: number = NOT_SET;
    private atLeastCount: number = NOT_SET;

    constructor(mockedFunction: F) {
        this.internalMocker = GetInternalMocker(mockedFunction);
        this.currentArgumentExpectations = null;
        this.internalMocker.isInExpectation = true;
        // Default to expecting 1
        const expectation: ExpectationData<F> = {
            internalMocker: this.internalMocker,
            expectedRange: new Range(1),
            location: StacktraceUtils.getCurrentMockLocation(3),
            answer: null,
            expectedArgs: this.currentArgumentExpectations,
            callCount: 0,
            inOrderOverride: null,
        };
        this.internalMocker.expectations.push(expectation);
        this.expectation = expectation;
    }

    public getExpectation(): ExpectationData<F> {
        return this.expectation;
    }

    public withArgs(...args: Parameters<F>): OnGoingStubs<F> {
        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        this.expectation.expectedArgs = this.currentArgumentExpectations;
        return this;
    }

    public andReturn(value: ReturnType<F>): OngoingStubbing<F> {
        this.expectation.answer = createDirectReturnAnswer(value);
        return this;
    }

    public andStubReturn(value: ReturnType<F>): void {
        this.expectation.answer = createDirectReturnAnswer(value);
        this.atLeast(0);
    }

    public andThrow(error: Error): OngoingStubbing<F> {
        this.expectation.answer = createDirectThrowAnswer(error);
        return this;
    }

    public andCallRealMethod(): OngoingStubbing<F> {
        const realFunction = this.internalMocker.realFunction;
        if (!realFunction) {
            throw new Error("No function was available. Ensure a real object was passed to the spy");
        }

        this.expectation.answer = createCallRealMethodAnwser(realFunction);
        return this;
    }

    public andAnswer(answer: Answer<ReturnType<F>>): OngoingStubbing<F> {
        this.expectation.answer = answer;
        return this;
    }

    public andResolve(value: UnwrapPromise<ReturnType<F>>): OngoingStubbing<F> {
        this.expectation.answer = createPromiseResolveAnswer(value);
        return this;
    }

    public andReject(error: Error): OngoingStubbing<F> {
        this.expectation.answer = createPromiseRejectAnswer(error);
        return this;
    }

    public times(count: number): OngoingStubbing<F> {
        this.setExpectedRange(new Range(count));
        return this;
    }

    public once(): OngoingStubbing<F> {
        return this.times(1);
    }

    public twice(): OngoingStubbing<F> {
        return this.times(2);
    }

    public atMost(atMostInvocations: number): OngoingStubbing<F> {
        this.atMostCount = atMostInvocations;
        this.atLeastCount = this.atLeastCount !== NOT_SET ? this.atLeastCount : 0;
        this.setExpectedRange(new Range(this.atLeastCount, this.atMostCount));
        return this;
    }

    public atLeast(atLeastInvocations: number): OngoingStubbing<F> {
        this.atLeastCount = atLeastInvocations;
        this.atMostCount = this.atMostCount !== NOT_SET ? this.atMostCount : Number.MAX_SAFE_INTEGER;
        this.setExpectedRange(new Range(this.atLeastCount, this.atMostCount));
        return this;
    }

    private setExpectedRange(range: Range) {
        this.expectation.expectedRange = range;
        const expectations = this.internalMocker.expectations;
        if (expectations.length > 1 && range.isFixedRange()) {
            if (!expectations[expectations.length - 2].expectedRange.isFixedRange()) {
                throw new Error("Previous expecatation had a non fixed range.");
            }
        }
    }
}

export { OnGoingStubs, OngoingStubbing, normalizeMatcherArgs, };
