import { Answer, MockableFunction, MockOptions } from "./Mock";
import { ArgumentMatcher } from "./MockedFunction";
import { Verifier } from "./Verify";

interface ExpectationData<F extends MockableFunction> {
    verifier: Verifier<any>;
    location: string | null;
    expectedArgs: ArgumentMatcher;
    answer: Answer<F> | null;
    callCount: number;
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

    isInExpectation: boolean;
}

const INTERNAL_MOCKER_NAME = "__internalMocker";
function GetInternalMocker<F extends MockableFunction>(mock: F): InternalMocker<F> {
    const internalMocker: InternalMocker<F> = (mock as any)[INTERNAL_MOCKER_NAME];
    if (!internalMocker) {
        throw new Error(`Passed an object that was not a mock. Object: ${JSON.stringify(mock)}`);
    }

    return internalMocker;
}

function CreateInternalMocker<F extends MockableFunction>(mockedFunction: F, realFunction: F, options: MockOptions) {
    const internalMocker: InternalMocker<F> = {
        expectations: [],
        recordedInvocations: [],
        realFunction: realFunction,
        options: options,
        isInExpectation: false,
    };

    (mockedFunction as any)[INTERNAL_MOCKER_NAME] = internalMocker;
    return internalMocker;
}

export {
    CreateInternalMocker,
    ExpectationData,
    GetInternalMocker,
    InternalMocker,
    INTERNAL_MOCKER_NAME,
    RecordedInvocation,
};
