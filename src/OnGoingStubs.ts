import { ArgumentValidator, eq } from "@umbra-test/umbra-util";
import { Expect } from "umbra-assert";
import { createInvalidMockError, ExpectationData, GetInternalMockerSafe, InternalMocker } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { Range } from "./Range";
import { StacktraceUtils } from "./StackTraceParser";

type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;

type OngoingStubbing<T> = T extends never ? never :
    T extends (...args: any) => never ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> :
    T extends (...args: any) => infer R ?
    (
        R extends Promise<any> ? PromiseOnGoingStubbing<T, PromiseOnGoingStubbing<T, any>> :
        R extends void ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> : ReturnableOnGoingStubbing<T, ReturnableOnGoingStubbing<T, any>>
    ) : PromiseOnGoingStubbing<any, PromiseOnGoingStubbing<any, any>>;

interface PromiseOnGoingStubbing<F extends MockableFunction, G extends PromiseOnGoingStubbing<F, G>> extends ReturnableOnGoingStubbing<F, G> {

    andResolve(values: UnwrapPromise<ReturnType<F>>): G;

    andStubResolve(values: UnwrapPromise<ReturnType<F>>): void;

    andReject(values: Error): G;

    andStubReject(values: Error): void;

}

interface ReturnableOnGoingStubbing<F extends MockableFunction, G extends ReturnableOnGoingStubbing<F, G>> extends BaseOngoingStubbing<F, G> {

    andReturn(values: ReturnType<F>): G;

    andStubReturn(values: ReturnType<F>): void;

}

interface BaseOngoingStubbing<F extends MockableFunction, G extends BaseOngoingStubbing<F, G>> {

    withArgs(...args: Parameters<F>): G;

    andThrow(error: Error): G;

    andStubThrow(error: Error): void;

    andCallRealMethod(): G;

    andAnswer(answer: Answer<F>): G;

    andStubAnswer(answer: Answer<F>): void;

    times(wantedNumberOfInvocations: number): G;

    atLeast(atLeastInvocations: number): G;

    atMost(atMostInvocations: number): G;

    once(): G;

    twice(): G;

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
        const argMatcher: any = GetInternalMockerSafe(arg) === null && typeof arg.matches === "function" ? arg : eq(arg);
        normalizedArgs.push(argMatcher);
    }
    return normalizedArgs;
}

const NOT_SET = -1;
class OnGoingStubs<F extends MockableFunction> extends Expect implements PromiseOnGoingStubbing<F, any> {

    public readonly internalMocker: InternalMocker<F> | null;
    private readonly mockedFunction: F;
    private currentArgumentExpectations: ArgumentMatcher;
    private expectation: ExpectationData<F> | null;
    private atMostCount: number = NOT_SET;
    private atLeastCount: number = NOT_SET;
    private timesCount: number = NOT_SET;

    constructor(mockedFunction: F) {
        super(mockedFunction);
        this.mockedFunction = mockedFunction;
        this.internalMocker = GetInternalMockerSafe(mockedFunction);
        this.currentArgumentExpectations = null;
        if (this.internalMocker) {
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
        } else {
            this.expectation = null;
        }
    }

    public getExpectation(): ExpectationData<F> {
        if (this.expectation === null) {
            throw new Error("Tried to access expectation on an invalid mock");
        }
        return this.expectation;
    }

    public withArgs(...args: Parameters<F>): OnGoingStubs<F> {
        if (this.expectation === null) {
            throw new Error("Cannot set arguments expectations, an invalid mock object was provided");
        }

        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        this.expectation.expectedArgs = this.currentArgumentExpectations;
        return this;
    }

    public andReturn(value: ReturnType<F>): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createDirectReturnAnswer(value);
        return this;
    }

    public andStubReturn(value: ReturnType<F>): void {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createDirectReturnAnswer(value);
        this.atLeast(0);
    }

    public andThrow(error: Error): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createDirectThrowAnswer(error);
        return this;
    }

    public andStubThrow(error: Error): void {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createDirectThrowAnswer(error);
        this.atLeast(0);
    }

    public andCallRealMethod(): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null || this.internalMocker === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        const realFunction = this.internalMocker.realFunction;
        if (!realFunction) {
            throw new Error("No function was available. Ensure a real object was passed to the spy");
        }

        this.expectation.answer = createCallRealMethodAnwser(realFunction);
        return this;
    }

    public andAnswer(answer: Answer<ReturnType<F>>): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = answer;
        return this;
    }

    public andStubAnswer(answer: Answer<ReturnType<F>>): void {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = answer;
        this.atLeast(0);
    }

    public andResolve(value: UnwrapPromise<ReturnType<F>>): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createPromiseResolveAnswer(value);
        return this;
    }

    public andStubResolve(value: UnwrapPromise<ReturnType<F>>): void {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createPromiseResolveAnswer(value);
        this.atLeast(0);
    }

    public andReject(error: Error): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createPromiseRejectAnswer(error);
        return this;
    }

    public andStubReject(error: Error): void {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        this.expectation.answer = createPromiseRejectAnswer(error);
        this.atLeast(0);
    }

    public times(count: number): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        if (this.timesCount !== NOT_SET || this.atLeastCount !== NOT_SET || this.atMostCount !== NOT_SET) {
            throw new Error("Previously set expectation count, value must only be set once");
        }

        this.timesCount = count;
        this.setExpectedRange(new Range(count));
        return this;
    }

    public once(): PromiseOnGoingStubbing<F, any> {
        return this.times(1);
    }

    public twice(): PromiseOnGoingStubbing<F, any> {
        return this.times(2);
    }

    public atMost(atMostInvocations: number): PromiseOnGoingStubbing<F, any> {
        if (this.expectation === null) {
            throw createInvalidMockError(this.mockedFunction);
        }

        if (this.timesCount !== NOT_SET || (this.atMostCount !== NOT_SET && this.atMostCount !== Number.MAX_SAFE_INTEGER)) {
            throw new Error("Previously set expectation count, value must only be set once");
        }

        this.atMostCount = atMostInvocations;
        this.atLeastCount = this.atLeastCount !== NOT_SET ? this.atLeastCount : 0;
        this.setExpectedRange(new Range(this.atLeastCount, this.atMostCount));
        return this;
    }

    public atLeast(atLeastInvocations: number): PromiseOnGoingStubbing<F, any> {
        if (this.timesCount !== NOT_SET || (this.atLeastCount !== NOT_SET && this.atLeastCount !== 0)) {
            throw new Error("Previously set expectation count, value must only be set once");
        }

        this.atLeastCount = atLeastInvocations;
        this.atMostCount = this.atMostCount !== NOT_SET ? this.atMostCount : Number.MAX_SAFE_INTEGER;
        this.setExpectedRange(new Range(this.atLeastCount, this.atMostCount));
        return this;
    }

    private setExpectedRange(range: Range) {
        const expectations = this.internalMocker!.expectations;
        if (expectations.length > 1 && range.isFixedRange()) {
            const newExpectations = expectations[expectations.length - 1];
            const lastExpectations = expectations[expectations.length - 2];
            if (!lastExpectations.expectedRange.isFixedRange()) {
                if (this.doArgumentsMatch(lastExpectations, newExpectations)) {
                    throw new Error("Previous expectation had a non fixed range.");
                }
            }
        }

        this.expectation!.expectedRange = range;
    }
    private doArgumentsMatch(lastExpectations: ExpectationData<F>, newExpectations: ExpectationData<F>): boolean {
        if (newExpectations.expectedArgs === null || lastExpectations.expectedArgs === null) {
            return lastExpectations.expectedArgs === null && newExpectations.expectedArgs === null;
        }

        if (newExpectations.expectedArgs.length !== lastExpectations.expectedArgs.length) {
            return false;
        }

        for (let i = 0; i < newExpectations.expectedArgs.length; i++) {
            const lastArg = lastExpectations.expectedArgs[i];
            const newArg = newExpectations.expectedArgs[i];
            if (!newArg.equals(lastArg)) {
                return false;
            }
        }

        return true;
    }
}

export { OnGoingStubs, OngoingStubbing, ReturnableOnGoingStubbing, BaseOngoingStubbing, normalizeMatcherArgs };
