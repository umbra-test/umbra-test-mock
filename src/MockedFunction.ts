import { ArgumentValidator } from "./ArgumentValidator";
import { GetInternalMocker, ExpectationData } from "./InternalMocker";
import { Answer, MockableFunction, StrictnessMode } from "./Mock";
import { StacktraceUtils } from "./StackTraceParser";
import { SortedArray } from "./Utils/SortedArray";

type ArgumentMatcher = ArgumentValidator<any>[] | null;
function findBestArgumentMatcher<F extends MockableFunction>(
    expectations: ExpectationData<F>[],
    args: any[]): ExpectationData<F> | null {
    const argumentMatcherArray: SortedArray<ExpectationData<F>> = new SortedArray((a, b) => {
        if (a === undefined && b === undefined) {
            return 0;
        } else if (a === undefined) {
            return 1;
        } else if (b === undefined) {
            return -1;
        }

        if (a.expectedArgs === null && b.expectedArgs === null) {
            return 0;
        } else if (a.expectedArgs === null) {
            return 1;
        } else if (b.expectedArgs === null) {
            return -1;
        }

        return b.expectedArgs.length - a.expectedArgs.length;
    });
    for (const expectation of expectations) {
        argumentMatcherArray.insert(expectation);
    }
    for (const expectation of argumentMatcherArray.getData()) {
        const expectedArgs = expectation.expectedArgs;
        const isValid = verifyArgumentMatcher(expectedArgs, args);
        if (isValid) {
            return expectation;
        }
    }

    return null;
}

function verifyArgumentMatcher(expectedArgs: ArgumentMatcher, args: any[]): boolean {
    if (expectedArgs === null) {
        // Null should always be last
        return true;
    }

    if (args.length < expectedArgs.length) {
        // If we expect less args than those provided we cannot have a successful match
        return false;
    }

    let isValid = true;
    if (expectedArgs.length === 0) {
        isValid = args.length === 0;
    }
    for (let i = 0; i < expectedArgs.length; i++) {
        const argumentValidator = expectedArgs[i];
        const arg = args[i];
        isValid = isValid && argumentValidator.matches(arg);
    }

    return isValid;
}

function createMockedFunction<F extends MockableFunction>(): F {
    const mock = (...args: Parameters<F>): ReturnType<F> | null => {
        const internalMocker = GetInternalMocker(mockedFunc);
        internalMocker.recordedInvocations.push({
            params: args,
            location: StacktraceUtils.getCurrentMockLocation(2)
        });

        const expectationData: ExpectationData<F> | null = findBestArgumentMatcher(internalMocker.expectations, args);
        if (expectationData !== null) {
            expectationData.callCount++;
            if (!expectationData.answer) {
                // At this point we don't know the return type and there's no way to flexibly require it 
                // in the interface.
                return undefined as any;
            }
            const result = expectationData.answer(...args);
            return result;
        }

        if (internalMocker.options.strictMode === StrictnessMode.Strict) {
            let expectations = "";
            for (const expectation of internalMocker.expectations) {
                if (expectation.expectedArgs === null) {
                    expectations += `${mockedFunc.name} no specific arguments specified`;
                } else {
                    const argData: string[] = [];
                    for (const argumentValdiatorArg of expectation.expectedArgs) {
                        if (argumentValdiatorArg.description) {
                            argData.push(argumentValdiatorArg.description());
                        } else {
                            argData.push(argumentValdiatorArg.toString());
                        }
                    }
                    expectations += `${mockedFunc.name}(${argData.join(", ")}) at ${expectation.location}\n`;
                }
            }
            // Unicode space is to trick reporter to have a blank line which seems to call trim()
            expectations = expectations ? ` Expectations:\n${expectations}\u00A0` : "";
            const wording = internalMocker.expectations.length > 0 ? "matched" : "was set";
            const argsStringified: string[] = [];
            for (const arg of args) {
                argsStringified.push(JSON.stringify(arg));
            }
            const argsText = argsStringified.join(", ");
            throw new Error(`${mockedFunc.name}(${argsText}) was called but no expectation ${wording}.${expectations}`);
        }

        return null;
    };

    const mockedFunc: F = mock as F;
    return mockedFunc;
}

export { createMockedFunction, findBestArgumentMatcher, ArgumentMatcher, verifyArgumentMatcher };
