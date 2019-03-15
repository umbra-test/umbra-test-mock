import { ExpectationData, RecordedInvocation } from "./InternalMocker";
import { MockableFunction } from "./Mock";
import { ArgumentMatcher, verifyArgumentMatcher } from "./MockedFunction";
import { Verifier } from "./Verify";

class CountableVerifier<T extends MockableFunction> implements Verifier<T> {
    private readonly verifyFunction: (actualCount: number, calledLocations: string[]) => void;
    private readonly expectedArgs: ArgumentMatcher;

    constructor(expectedArgs: ArgumentMatcher,
                verifyFunction: (actualCount: number, calledLocations: string[]) => void) {
        this.expectedArgs = expectedArgs;
        this.verifyFunction = verifyFunction;
    }

    public verify(args: RecordedInvocation<T>[], expectationData: ExpectationData<T>): void {
        const results = this.countNumberOfInvocations(args, expectationData);
        this.verifyFunction(results.count, results.callLocations);
    }

    private countNumberOfInvocations(args: RecordedInvocation<T>[],
                                     expectationData: ExpectationData<T>): { count: number, callLocations: string[] } {
        const callLocations: string[] = [];
        for (const invocation of args) {
            if (this.expectedArgs === null) {
                if (invocation.location !== null) {
                    callLocations.push(invocation.location);
                }
            }
        }
        return {
            count: expectationData.callCount,
            callLocations: callLocations
        };
    }
}

export {
    CountableVerifier
};