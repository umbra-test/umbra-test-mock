import { ArgumentValidator } from "./ArgumentValidator";
import { GetInternalMocker } from "./InternalMocker";
import { Answer, MockableFunction, StrictnessMode } from "./Mock";

type ArgumentMatcher = ArgumentValidator<any>[] | null;
function findBestArgumentMatcher(stubs: ArgumentMatcher[], args: any[]): ArgumentMatcher {
    // Sort by length so more specific matchers are checked first
    const sortedKeys = stubs.sort((a, b) => {
        if (a === null) {
            return 1;
        }

        if (b === null) {
            return -1;
        }

        return b.length - a.length;
    });

    for (const key of sortedKeys) {
        if (key === null) {
            // Null should always be last
            return key;
        }

        if (args.length < key.length) {
            // If we expect less args than those provided we cannot have a successful match
            continue;
        }

        let isValid = true;
        for (let i = 0; i < key.length; i++) {
            const argumentValidator = key[i];
            const arg = args[i];
            isValid = isValid && argumentValidator.matches(arg);
        }

        if (isValid) {
            return key;
        }
    }

    return null;
}

function createMockedFunction<F extends MockableFunction>(): F {
    const func = (...args: Parameters<F>): ReturnType<F> | null => {
        const internalMocker = GetInternalMocker(mockedFunc);
        internalMocker.recordedInvocations.push(args);

        const stubs: (ArgumentValidator<any>[] | null)[] = Array.from(internalMocker.stubs.keys());
        const bestArgs: ArgumentValidator<any>[] | null = findBestArgumentMatcher(stubs, args);
        const answers: Answer<F>[] | undefined = internalMocker.stubs.get(bestArgs);
        if (answers !== undefined && answers.length > 0) {
            const nextAnswer = answers.pop();
            if (nextAnswer === undefined) {
                throw new Error("Missing next answer");
            }

            const result = nextAnswer(...args);
            if (answers.length === 0) {
                // If this was the last answer, push it back on
                answers.push(nextAnswer);
            }

            return result;
        }

        if (internalMocker.options.strictMode === StrictnessMode.Strict) {
            if (stubs.length === 0) {
                throw new Error(`${mockedFunc.name}(${args}) was called but no expectation was set`);
            }

            let expectations = "";
            for (const stub of stubs) {
                if (stub === null) {
                    expectations += `${mockedFunc.name} no specific arguments specified`;
                } else {
                    let argData = "";
                    for (const stubArg of stub) {
                        if (stubArg.description) {
                            argData += stubArg.description();
                        } else {
                            argData += stubArg.toString();
                        }
                    }
                    expectations += `${mockedFunc.name}(${argData})\n`;
                }
            }
            throw new Error(`${mockedFunc.name}(${args}) was called but no expectation matched. Expectations:
${expectations}`);
        }

        return null;
    };

    const mockedFunc: F = func as F;
    return mockedFunc;
}

export {
    createMockedFunction,
    findBestArgumentMatcher,
    ArgumentMatcher,
};