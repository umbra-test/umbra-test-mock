import { INTERNAL_MOCKER_NAME } from "@umbra-test/umbra-util";
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
declare enum MockType {
    Instance = 0,
    Static = 1,
    Partial = 2
}
interface InternalMocker<F extends MockableFunction> {
    readonly expectations: ExpectationData<F>[];
    readonly recordedInvocations: RecordedInvocation<F>[];
    readonly realFunction: F;
    readonly options: MockOptions;
    mockName: string;
    inProgressInOrder: InOrderExpectation[];
    isInExpectation: boolean;
    mockType: MockType;
}
declare function GetInternalMockerSafe<F extends MockableFunction>(mock: F): InternalMocker<F> | null;
declare function GetInternalMocker<F extends MockableFunction>(mock: F): InternalMocker<F>;
declare function createInvalidMockError(object: any): Error;
declare function CreateInternalMocker<F extends MockableFunction>(mockedFunction: F, realFunction: F, mockName: string | null, options: MockOptions, mockType: MockType): InternalMocker<F>;
export { CreateInternalMocker, ExpectationData, GetInternalMocker, GetInternalMockerSafe, createInvalidMockError, InternalMocker, INTERNAL_MOCKER_NAME, RecordedInvocation, MockType };
