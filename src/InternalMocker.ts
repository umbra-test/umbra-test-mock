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

enum MockType {
    Full,
    Partial
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

function GetInternalMockerSafe<F extends MockableFunction>(mock: F): InternalMocker<F> | null {
    const internalMocker: InternalMocker<F> = (mock as any)[INTERNAL_MOCKER_NAME];
    return internalMocker ?? null;
}

function GetInternalMocker<F extends MockableFunction>(mock: F): InternalMocker<F> {
    const internalMocker = GetInternalMockerSafe(mock);
    if (internalMocker === null) {
        throw new Error(`Passed an object that was not a mock. Object: ${mock.toString()}`);
    }

    return internalMocker;
}

function CreateInternalMocker<F extends MockableFunction>(mockedFunction: F,
                                                          realFunction: F,
                                                          mockName: string | null,
                                                          options: MockOptions,
                                                          mockType: MockType)
{
    const internalMocker: InternalMocker<F> = {
        expectations: [],
        recordedInvocations: [],
        realFunction: realFunction,
        options: options,
        inProgressInOrder: [],
        isInExpectation: false,
        mockName: mockName ?? "mock",
        mockType: mockType
    };

    (mockedFunction as any)[INTERNAL_MOCKER_NAME] = internalMocker;
    return internalMocker;
}

export {
    CreateInternalMocker,
    ExpectationData,
    GetInternalMocker,
    GetInternalMockerSafe,
    InternalMocker,
    INTERNAL_MOCKER_NAME,
    RecordedInvocation,
    MockType
};
