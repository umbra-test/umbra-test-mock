import { ArgumentValidator, printObject, SortedArray } from "@umbra-test/umbra-util";
import { ExpectationData, GetInternalMocker, MockType } from "./InternalMocker";
import { MockableFunction, StrictnessMode } from "./Mock";
import { StacktraceUtils } from "./StackTraceParser";

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

        // If we're expecting something in order it must be given precedence over all other matchers
        if (a.inOrderOverride !== null && b.inOrderOverride == null) {
            return -1;
        }

        if (a.inOrderOverride === null && b.inOrderOverride !== null) {
            return 1;
        }

        // If we have expectations set
        if (a.expectedArgs === null && b.expectedArgs === null) {
            // No expectations set on either mock equivalent of:
            // expect(func1).once()
            // expect(func2).once()
            return 0;
        } else if (a.expectedArgs === null) {
            // b should be preferred if it has args and a does not
            return 1;
        } else if (b.expectedArgs === null) {
            return -1;
        }

        // More args is preferred. This is to handle overloads/optional args properly
        const argLengthDifference = b.expectedArgs.length - a.expectedArgs.length;
        if (argLengthDifference !== 0) {
            return argLengthDifference;
        }

        // Finally sort by matcher precedence. In general this means eq() first, any() last
        const aMatcherPrecedence = sumMatchers(a.expectedArgs);
        const bMatcherPrecedence = sumMatchers(b.expectedArgs);
        return bMatcherPrecedence - aMatcherPrecedence;
    });
    for (const expectation of expectations) {
        argumentMatcherArray.insert(expectation);
    }
    for (const expectation of argumentMatcherArray.getData()) {
        if (expectation.callCount >= expectation.expectedRange.end) {
            continue;
        }
        const expectedArgs = expectation.expectedArgs;
        const isValid = verifyArgumentMatcher(expectedArgs, args);
        if (isValid) {
            return expectation;
        }
    }

    return null;
}

function sumMatchers(expectedArgs: ArgumentValidator<any>[]): number {
    let sum = 0;
    for (const arg of expectedArgs) {
        sum += arg.precedence !== undefined ? arg.precedence : 0;
    }
    return sum;
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

interface ExpectationOptions {
    includeLocation: boolean;
}

const defaultExpectationOptions: ExpectationOptions = { includeLocation: true };
function buildExpectationString<F extends MockableFunction>(expectation: ExpectationData<F>, options: ExpectationOptions = defaultExpectationOptions) {
    const mockedFuncName = expectation.internalMocker.mockName || "mock";
    let argsString = `\t${mockedFuncName}`;
    if (expectation.expectedArgs === null) {
        argsString += `() with any arguments`;
    } else {
        const argData: string[] = [];
        for (const argumentValdiatorArg of expectation.expectedArgs) {
            if (argumentValdiatorArg.description) {
                argData.push(argumentValdiatorArg.description());
            } else {
                argData.push(argumentValdiatorArg.toString());
            }
        }
        argsString += `(${argData.join(", ")})`;
    }

    argsString += `. Expected ${expectation.expectedRange.describeRange()}, so far ${expectation.callCount}.`;

    if (options.includeLocation) {
        argsString += `\n\tExpectation set at ${expectation.location}`;
    }

    return argsString + "\n";
}

function createMockedFunction<F extends MockableFunction>(): F {
    const mock = function(this: any, ...args: Parameters<F>): ReturnType<F> | null {
        const internalMocker = GetInternalMocker(mockedFunc);
        const currentLocation = StacktraceUtils.getCurrentMockLocation(2);
        internalMocker.recordedInvocations.push({
            params: args,
            location: currentLocation
        });

        const expectationData: ExpectationData<F> | null = findBestArgumentMatcher(internalMocker.expectations, args);
        if (expectationData !== null) {
            if (expectationData.inOrderOverride) {
                const inOrderOverride = expectationData.inOrderOverride;
                const expectedInvocation = inOrderOverride.expectations[inOrderOverride.currentIndex];
                if (expectedInvocation !== expectationData) {
                    const expectedInvocationString = buildExpectationString(expectedInvocation);
                    throw new Error(`Out of order method call.\nExpected:\n${expectedInvocationString}\n` +
                        `Actual:\n${buildExpectationString(expectationData, { includeLocation: false })}` +
                        `\tCalled at ${currentLocation}`);
                } else {
                    if (inOrderOverride.currentIndex === 0) {
                        internalMocker.inProgressInOrder.push(inOrderOverride);
                    }
                    inOrderOverride.currentIndex++;
                    if (inOrderOverride.currentIndex > inOrderOverride.expectations.length) {
                        const inProgressIndex = internalMocker.inProgressInOrder.indexOf(inOrderOverride);
                        if (inProgressIndex === -1) {
                            throw new Error("Could not find in progress index");
                        }

                        internalMocker.inProgressInOrder.splice(inProgressIndex, 1);
                    }
                }
            } else if (internalMocker.inProgressInOrder.length > 0) {
                throw new Error(`Out of order method call.`);
            }

            expectationData.callCount++;
            if (!expectationData.answer) {
                // At this point we don't know the return type and there's no way to flexibly require it
                // in the interface.
                return undefined as ReturnType<F>;
            }
            const result = expectationData.answer(...args);
            return result;
        }

        if (internalMocker.mockType === MockType.Partial) {
            return internalMocker.realFunction.apply(this, args);
        }

        if (internalMocker.options.strictMode === StrictnessMode.Strict) {
            let expectations = "";
            for (const expectation of internalMocker.expectations) {
                expectations += buildExpectationString(expectation) + "\n";
            }
            // Unicode space is to trick mocha reporter to have a blank line which seems to call trim()
            expectations = expectations ? `\nExpectations:\n${expectations}\u00A0` : "";
            const wording = internalMocker.expectations.length > 0 ? "matched" : "was set";
            const argsStringified: string[] = [];
            for (const arg of args) {
                argsStringified.push(printObject(arg));
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
