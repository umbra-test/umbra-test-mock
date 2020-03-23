import { ExpectationData } from "./InternalMocker";
import { BaseOngoingStubbing, OngoingStubbing } from "./OnGoingStubs";
declare type Answer<F extends MockableFunction> = (...args: Parameters<F>) => ReturnType<F>;
declare type MockableFunction = (...args: any[]) => any;
declare enum StrictnessMode {
    Strict = 0,
    Loose = 1
}
interface MockOptions {
    strictMode: StrictnessMode;
    inOrder: boolean;
}
declare type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);
declare function setDefaultOptions(options: Partial<MockOptions>): void;
declare function mock<T>(object?: ClassConstructor<T>, mockName?: string): T;
declare function mock<T extends object>(mockName: string): T;
declare function partialMock<T extends object>(realObject: T, options?: MockOptions): T;
declare function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F>;
interface InOrderExpectation {
    expectations: ExpectationData<any>[];
    currentIndex: number;
}
declare function inOrder(...stubs: BaseOngoingStubbing<any, any>[]): void;
export { inOrder, mock, partialMock, expect, setDefaultOptions, MockableFunction, InOrderExpectation, Answer, MockOptions, StrictnessMode, ClassConstructor, };
