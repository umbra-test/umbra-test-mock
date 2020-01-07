import { ArgumentValidator } from "@umbra-test/umbra-util";
import { ExpectationData, InternalMocker } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
declare type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;
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
    atMost(atMostInvocations: number): OngoingStubbing<F>;
    once(): OngoingStubbing<F>;
    twice(): OngoingStubbing<F>;
}
declare function normalizeMatcherArgs<F extends MockableFunction>(args: Parameters<F>): ArgumentValidator<any>[];
declare class OnGoingStubs<F extends MockableFunction> implements OngoingStubbing<F> {
    readonly internalMocker: InternalMocker<F>;
    private currentArgumentExpectations;
    private expectation;
    private atMostCount;
    private atLeastCount;
    private timesCount;
    constructor(mockedFunction: F);
    getExpectation(): ExpectationData<F>;
    withArgs(...args: Parameters<F>): OnGoingStubs<F>;
    andReturn(value: ReturnType<F>): OngoingStubbing<F>;
    andStubReturn(value: ReturnType<F>): void;
    andThrow(error: Error): OngoingStubbing<F>;
    andCallRealMethod(): OngoingStubbing<F>;
    andAnswer(answer: Answer<ReturnType<F>>): OngoingStubbing<F>;
    andResolve(value: UnwrapPromise<ReturnType<F>>): OngoingStubbing<F>;
    andReject(error: Error): OngoingStubbing<F>;
    times(count: number): OngoingStubbing<F>;
    once(): OngoingStubbing<F>;
    twice(): OngoingStubbing<F>;
    atMost(atMostInvocations: number): OngoingStubbing<F>;
    atLeast(atLeastInvocations: number): OngoingStubbing<F>;
    private setExpectedRange;
    private doArgumentsMatch;
}
export { OnGoingStubs, OngoingStubbing, normalizeMatcherArgs };
