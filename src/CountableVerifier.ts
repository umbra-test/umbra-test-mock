import { RecordedInvocation } from "./InternalMocker";
import { MockableFunction } from "./Mock";
import { ArgumentMatcher, findBestArgumentMatcher } from "./MockedFunction";
import { Verifier } from "./Verify";

class CountableVerifier<T extends MockableFunction> implements Verifier<T> {
    private readonly verifyFunction: (actualCount: number, calledLocations: string[]) => void;
    private readonly expectedArgs: ArgumentMatcher;

    constructor(expectedArgs: ArgumentMatcher,
                verifyFunction: (actualCount: number, calledLocations: string[]) => void)
    {
        this.expectedArgs = expectedArgs;
        this.verifyFunction = verifyFunction;
    }

    public verify(args: RecordedInvocation<T>[]): void {
        const results = this.countNumberOfInvocations(args);
        this.verifyFunction(results.count, results.callLocations);
    }

    private countNumberOfInvocations(args: RecordedInvocation<T>[]): { count: number, callLocations: string[] } {
        let invocationCount = 0;
        const callLocations: string[] = [];
        for (const invocation of args) {
            if (this.expectedArgs === null ||
                findBestArgumentMatcher([this.expectedArgs], invocation.params) !== null)
            {
                invocationCount++;
                if (invocation.location !== null) {
                    callLocations.push(invocation.location);
                }
            }
        }
        return {
            count: invocationCount,
            callLocations: callLocations
        };
    }
}

export {
    CountableVerifier
};