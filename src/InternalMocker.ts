import { ArgumentValidator } from "./ArgumentValidator";
import { Answer, MockableFunction, MockOptions } from "./Mock";
import { Verifier } from "./Verify";


interface InternalMocker<F extends MockableFunction> {

    readonly stubs: Map<ArgumentValidator<any>[] | null, Answer<F>[]>;

    readonly expectations: Verifier<any>[];

    readonly recordedInvocations: Parameters<F>[];

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
        stubs: new Map(),
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
    InternalMocker,
    GetInternalMocker,
    CreateInternalMocker,
    INTERNAL_MOCKER_NAME,
};