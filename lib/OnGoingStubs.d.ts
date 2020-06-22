import { ArgumentValidator } from "@umbra-test/umbra-util";
import { Expect } from "umbra-assert";
import { ExpectationData, InternalMocker } from "./InternalMocker";
import { Answer, MockableFunction } from "./Mock";
declare type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;
declare type OngoingStubbing<T> = T extends never ? never : T extends (...args: any) => never ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> : T extends (...args: any) => infer R ? (R extends Promise<any> ? PromiseOnGoingStubbing<T, PromiseOnGoingStubbing<T, any>> : R extends void ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> : ReturnableOnGoingStubbing<T, ReturnableOnGoingStubbing<T, any>>) : PromiseOnGoingStubbing<any, PromiseOnGoingStubbing<any, any>>;
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
declare function normalizeMatcherArgs<F extends MockableFunction>(args: Parameters<F>): ArgumentValidator<any>[];
declare class OnGoingStubs<F extends MockableFunction> extends Expect implements PromiseOnGoingStubbing<F, any> {
    readonly internalMocker: InternalMocker<F> | null;
    private readonly mockedFunction;
    private currentArgumentExpectations;
    private expectation;
    private atMostCount;
    private atLeastCount;
    private timesCount;
    constructor(mockedFunction: F);
    getExpectation(): ExpectationData<F>;
    withArgs(...args: Parameters<F>): OnGoingStubs<F>;
    andReturn(value: ReturnType<F>): PromiseOnGoingStubbing<F, any>;
    andStubReturn(value: ReturnType<F>): void;
    andThrow(error: Error): PromiseOnGoingStubbing<F, any>;
    andStubThrow(error: Error): void;
    andCallRealMethod(): PromiseOnGoingStubbing<F, any>;
    andAnswer(answer: Answer<ReturnType<F>>): PromiseOnGoingStubbing<F, any>;
    andStubAnswer(answer: Answer<ReturnType<F>>): void;
    andResolve(value: UnwrapPromise<ReturnType<F>>): PromiseOnGoingStubbing<F, any>;
    andStubResolve(value: UnwrapPromise<ReturnType<F>>): void;
    andReject(error: Error): PromiseOnGoingStubbing<F, any>;
    andStubReject(error: Error): void;
    times(count: number): PromiseOnGoingStubbing<F, any>;
    once(): PromiseOnGoingStubbing<F, any>;
    twice(): PromiseOnGoingStubbing<F, any>;
    atMost(atMostInvocations: number): PromiseOnGoingStubbing<F, any>;
    atLeast(atLeastInvocations: number): PromiseOnGoingStubbing<F, any>;
    private setExpectedRange;
    private doArgumentsMatch;
}
export { OnGoingStubs, OngoingStubbing, ReturnableOnGoingStubbing, BaseOngoingStubbing, normalizeMatcherArgs };
