import { InternalMocker } from "./InternalMocker";
import { MockableFunction } from "./Mock";
import { ArgumentMatcher, findBestArgumentMatcher } from "./MockedFunction";
import { Verifier } from "./Verify";

class CountableVerifier<T extends MockableFunction> implements Verifier<T> {
    private readonly verifyFunction: (actualCount: number) => void;
    private readonly expectedArgs: ArgumentMatcher;

    constructor(expectedArgs: ArgumentMatcher,
                verifyFunction: (actualCount: number) => void)
    {
        this.verifyFunction = verifyFunction;
        this.expectedArgs = expectedArgs;
    }

    public verify(args: Parameters<T>[]): void {
        this.verifyFunction(this.countNumberOfInvocations(args));
    }

    private countNumberOfInvocations(args: Parameters<T>[]): number {
        if (this.expectedArgs === null) {
            return args.length;
        }
        else {
            let invocationCount = 0;
            for (const invocation of args) {
                if (findBestArgumentMatcher([this.expectedArgs], invocation) !== null) {
                    invocationCount++;
                }
            }
            return invocationCount;
        }
    }
}

export {
    CountableVerifier
};