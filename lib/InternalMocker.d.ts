import { Answer, InOrderExpectation, MockableFunction, MockOptions } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { Range } from "./Range";
interface ExpectationData<F extends MockableFunction> {
    internalMocker: InternalMocker<F>;
    expectedRange: Range;
    location: string | null;
    expectedArgs: ArgumentMatcher;
    answer: Answer<F> | null;
    callCount: number;
    inOrderOverride: InOrderExpectation | null;
}
interface RecordedInvocation<F extends MockableFunction> {
    readonly params: Parameters<F>;
    readonly location: string | null;
}
interface InternalMocker<F extends MockableFunction> {
    readonly expectations: ExpectationData<F>[];
    readonly recordedInvocations: RecordedInvocation<F>[];
    readonly realFunction: F;
    readonly options: MockOptions;
    mockName: string | null;
    inProgressInOrder: InOrderExpectation[];
    isInExpectation: boolean;
}
declare const INTERNAL_MOCKER_NAME = "__internalMocker";
declare function GetInternalMocker<F extends MockableFunction>(mock: F): InternalMocker<F>;
declare function CreateInternalMocker<F extends MockableFunction>(mockedFunction: F, realFunction: F, mockName: string | null, options: MockOptions): InternalMocker<F>;
export { CreateInternalMocker, ExpectationData, GetInternalMocker, InternalMocker, INTERNAL_MOCKER_NAME, RecordedInvocation, };
