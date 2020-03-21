"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const umbra_util_1 = require("@umbra-test/umbra-util");
const InternalMocker_1 = require("./InternalMocker");
const Mock_1 = require("./Mock");
const StackTraceParser_1 = require("./StackTraceParser");
function findBestArgumentMatcher(expectations, args) {
    const argumentMatcherArray = new umbra_util_1.SortedArray((a, b) => {
        if (a === undefined && b === undefined) {
            return 0;
        }
        else if (a === undefined) {
            return 1;
        }
        else if (b === undefined) {
            return -1;
        }
        if (a.inOrderOverride !== null && b.inOrderOverride == null) {
            return -1;
        }
        if (a.inOrderOverride === null && b.inOrderOverride !== null) {
            return 1;
        }
        if (a.expectedArgs === null && b.expectedArgs === null) {
            return 0;
        }
        else if (a.expectedArgs === null) {
            return 1;
        }
        else if (b.expectedArgs === null) {
            return -1;
        }
        const argLengthDifference = b.expectedArgs.length - a.expectedArgs.length;
        if (argLengthDifference !== 0) {
            return argLengthDifference;
        }
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
exports.findBestArgumentMatcher = findBestArgumentMatcher;
function sumMatchers(expectedArgs) {
    let sum = 0;
    for (const arg of expectedArgs) {
        sum += arg.precedence !== undefined ? arg.precedence : 0;
    }
    return sum;
}
function verifyArgumentMatcher(expectedArgs, args) {
    if (expectedArgs === null) {
        return true;
    }
    if (args.length < expectedArgs.length) {
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
exports.verifyArgumentMatcher = verifyArgumentMatcher;
const defaultExpectationOptions = { includeLocation: true };
function buildExpectationString(expectation, options = defaultExpectationOptions) {
    const mockedFuncName = expectation.internalMocker.mockName || "mock";
    let argsString = `\t${mockedFuncName}`;
    if (expectation.expectedArgs === null) {
        argsString += `() with any arguments`;
    }
    else {
        const argData = [];
        for (const argumentValdiatorArg of expectation.expectedArgs) {
            if (argumentValdiatorArg.description) {
                argData.push(argumentValdiatorArg.description());
            }
            else {
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
function createMockedFunction() {
    const mock = (...args) => {
        const internalMocker = InternalMocker_1.GetInternalMocker(mockedFunc);
        const currentLocation = StackTraceParser_1.StacktraceUtils.getCurrentMockLocation(2);
        internalMocker.recordedInvocations.push({
            params: args,
            location: currentLocation
        });
        const expectationData = findBestArgumentMatcher(internalMocker.expectations, args);
        if (expectationData !== null) {
            if (expectationData.inOrderOverride) {
                const inOrderOverride = expectationData.inOrderOverride;
                const expectedInvocation = inOrderOverride.expectations[inOrderOverride.currentIndex];
                if (expectedInvocation !== expectationData) {
                    const expectedInvocationString = buildExpectationString(expectedInvocation);
                    throw new Error(`Out of order method call.\nExpected:\n${expectedInvocationString}\n` +
                        `Actual:\n${buildExpectationString(expectationData, { includeLocation: false })}` +
                        `\tCalled at ${currentLocation}`);
                }
                else {
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
            }
            else if (internalMocker.inProgressInOrder.length > 0) {
                throw new Error(`Out of order method call.`);
            }
            expectationData.callCount++;
            if (!expectationData.answer) {
                return undefined;
            }
            const result = expectationData.answer(...args);
            return result;
        }
        if (internalMocker.options.strictMode === Mock_1.StrictnessMode.Strict) {
            let expectations = "";
            for (const expectation of internalMocker.expectations) {
                expectations += buildExpectationString(expectation) + "\n";
            }
            expectations = expectations ? `\nExpectations:\n${expectations}\u00A0` : "";
            const wording = internalMocker.expectations.length > 0 ? "matched" : "was set";
            const argsStringified = [];
            for (const arg of args) {
                argsStringified.push(JSON.stringify(arg));
            }
            const argsText = argsStringified.join(", ");
            throw new Error(`${mockedFunc.name}(${argsText}) was called but no expectation ${wording}.${expectations}`);
        }
        return null;
    };
    const mockedFunc = mock;
    return mockedFunc;
}
exports.createMockedFunction = createMockedFunction;
//# sourceMappingURL=MockedFunction.js.map