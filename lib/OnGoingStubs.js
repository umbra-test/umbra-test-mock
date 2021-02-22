"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMatcherArgs = exports.OnGoingStubs = void 0;
const umbra_util_1 = require("@umbra-test/umbra-util");
const umbra_assert_1 = require("umbra-assert");
const InternalMocker_1 = require("./InternalMocker");
const Range_1 = require("./Range");
const StackTraceParser_1 = require("./StackTraceParser");
function createDirectReturnAnswer(value) {
    return function directReturnAnswer() {
        return value;
    };
}
function createDirectThrowAnswer(error) {
    return function directThrowAnswer() {
        throw error;
    };
}
function createCallRealMethodAnwser(realFunction) {
    return function realMethodAnswer(...args) {
        return realFunction(args);
    };
}
function createPromiseResolveAnswer(value) {
    return function directReturnAnswer() {
        return Promise.resolve(value);
    };
}
function createPromiseRejectAnswer(error) {
    return function directReturnAnswer() {
        return Promise.reject(error);
    };
}
function normalizeMatcherArgs(args) {
    const normalizedArgs = [];
    for (const arg of args) {
        const argMatcher = InternalMocker_1.GetInternalMockerSafe(arg) === null && typeof arg.matches === "function" ? arg : umbra_util_1.eq(arg);
        normalizedArgs.push(argMatcher);
    }
    return normalizedArgs;
}
exports.normalizeMatcherArgs = normalizeMatcherArgs;
const NOT_SET = -1;
class OnGoingStubs extends umbra_assert_1.Expect {
    constructor(mockedFunction) {
        super(mockedFunction);
        this.atMostCount = NOT_SET;
        this.atLeastCount = NOT_SET;
        this.timesCount = NOT_SET;
        this.mockedFunction = mockedFunction;
        this.internalMocker = InternalMocker_1.GetInternalMockerSafe(mockedFunction);
        this.currentArgumentExpectations = null;
        if (this.internalMocker) {
            this.internalMocker.isInExpectation = true;
            const expectation = {
                internalMocker: this.internalMocker,
                expectedRange: new Range_1.Range(1),
                location: StackTraceParser_1.StacktraceUtils.getCurrentMockLocation(3),
                answer: null,
                expectedArgs: this.currentArgumentExpectations,
                callCount: 0,
                inOrderOverride: null,
            };
            this.internalMocker.expectations.push(expectation);
            this.expectation = expectation;
        }
        else {
            this.expectation = null;
        }
    }
    getExpectation() {
        if (this.expectation === null) {
            throw new Error("Tried to access expectation on an invalid mock");
        }
        return this.expectation;
    }
    withArgs(...args) {
        if (this.expectation === null) {
            throw new Error("Cannot set arguments expectations, an invalid mock object was provided");
        }
        this.currentArgumentExpectations = normalizeMatcherArgs(args);
        this.expectation.expectedArgs = this.currentArgumentExpectations;
        return this;
    }
    andReturn(value) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createDirectReturnAnswer(value);
        return this;
    }
    andStubReturn(value) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createDirectReturnAnswer(value);
        this.atLeast(0);
    }
    andThrow(error) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createDirectThrowAnswer(error);
        return this;
    }
    andStubThrow(error) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createDirectThrowAnswer(error);
        this.atLeast(0);
    }
    andCallRealMethod() {
        if (this.expectation === null || this.internalMocker === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        const realFunction = this.internalMocker.realFunction;
        if (!realFunction || InternalMocker_1.GetInternalMockerSafe(realFunction)) {
            throw new Error("Attempted to call the real method, but no real method was known. Use a partial mock with a real object passed.");
        }
        this.expectation.answer = createCallRealMethodAnwser(realFunction);
        return this;
    }
    andAnswer(answer) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = answer;
        return this;
    }
    andStubAnswer(answer) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = answer;
        this.atLeast(0);
    }
    andResolve(value) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createPromiseResolveAnswer(value);
        return this;
    }
    andStubResolve(value) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createPromiseResolveAnswer(value);
        this.atLeast(0);
    }
    andReject(error) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createPromiseRejectAnswer(error);
        return this;
    }
    andStubReject(error) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        this.expectation.answer = createPromiseRejectAnswer(error);
        this.atLeast(0);
    }
    times(count) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        if (this.timesCount !== NOT_SET || this.atLeastCount !== NOT_SET || this.atMostCount !== NOT_SET) {
            throw new Error("Previously set expectation count, value must only be set once");
        }
        this.timesCount = count;
        this.setExpectedRange(new Range_1.Range(count));
        return this;
    }
    once() {
        return this.times(1);
    }
    twice() {
        return this.times(2);
    }
    atMost(atMostInvocations) {
        if (this.expectation === null) {
            throw InternalMocker_1.createInvalidMockError(this.mockedFunction);
        }
        if (this.timesCount !== NOT_SET || (this.atMostCount !== NOT_SET && this.atMostCount !== Number.MAX_SAFE_INTEGER)) {
            throw new Error("Previously set expectation count, value must only be set once");
        }
        this.atMostCount = atMostInvocations;
        this.atLeastCount = this.atLeastCount !== NOT_SET ? this.atLeastCount : 0;
        this.setExpectedRange(new Range_1.Range(this.atLeastCount, this.atMostCount));
        return this;
    }
    atLeast(atLeastInvocations) {
        if (this.timesCount !== NOT_SET || (this.atLeastCount !== NOT_SET && this.atLeastCount !== 0)) {
            throw new Error("Previously set expectation count, value must only be set once");
        }
        this.atLeastCount = atLeastInvocations;
        this.atMostCount = this.atMostCount !== NOT_SET ? this.atMostCount : Number.MAX_SAFE_INTEGER;
        this.setExpectedRange(new Range_1.Range(this.atLeastCount, this.atMostCount));
        return this;
    }
    setExpectedRange(range) {
        const expectations = this.internalMocker.expectations;
        if (expectations.length > 1 && range.isFixedRange()) {
            const newExpectations = expectations[expectations.length - 1];
            const lastExpectations = expectations[expectations.length - 2];
            if (!lastExpectations.expectedRange.isFixedRange()) {
                if (this.doArgumentsMatch(lastExpectations, newExpectations)) {
                    throw new Error("Previous expectation had a non fixed range.");
                }
            }
        }
        this.expectation.expectedRange = range;
    }
    doArgumentsMatch(lastExpectations, newExpectations) {
        if (newExpectations.expectedArgs === null || lastExpectations.expectedArgs === null) {
            return lastExpectations.expectedArgs === null && newExpectations.expectedArgs === null;
        }
        if (newExpectations.expectedArgs.length !== lastExpectations.expectedArgs.length) {
            return false;
        }
        for (let i = 0; i < newExpectations.expectedArgs.length; i++) {
            const lastArg = lastExpectations.expectedArgs[i];
            const newArg = newExpectations.expectedArgs[i];
            if (!newArg.equals(lastArg)) {
                return false;
            }
        }
        return true;
    }
}
exports.OnGoingStubs = OnGoingStubs;
//# sourceMappingURL=OnGoingStubs.js.map