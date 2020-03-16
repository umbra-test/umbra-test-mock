"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const umbra_assert_1 = require("umbra-assert");
const TestClass_1 = require("./TestClass");
require("mocha");
const MOCK_RETURN_VALUE = 200;
const NUMBER_CALL_PARAM_1 = 10;
const STRING_CALL_PARAM_1 = "callParam1";
describe("ES6 class strict test cases", () => {
    describe("mock", () => {
        it("should throw if the expectation already matched its count", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).once();
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 1.\n\tExpectation set at .*?StrictEs6ClassTest.ts:17:13/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should fail if no expectation matches and print the expectations", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("randoString").andReturn(TestClass_1.REAL_NUMBER_RETURN_VALUE);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("callPraam1").andReturn(-1);
            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\("randoString"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:35:13\n\n\tmethod1StringArgNumberReturn\("callPraam1"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:36:13\n/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should fail verify if not called enough times", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(TestClass_1.REAL_NUMBER_RETURN_VALUE);
            let didThrow = false;
            try {
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\nExpected at: .*?StrictEs6ClassTest\.ts:52:13/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if mocked value is not called three times when expected", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).times(3);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            let didThrow = false;
            try {
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /Expected 3 invocations, got 2.\nExpected at: .*?StrictEs6ClassTest\.ts:68:13\nCalled at:\n.*?StrictEs6ClassTest\.ts:70:46\n.*?StrictEs6ClassTest\.ts:71:46\n/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if first in order expectation is called out of order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once(), __1.expect(mockedTestInterface.method2StringArgNumberReturn).once());
            let didThrow = false;
            try {
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:88:17\n\nActual:\n\tmethod2StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at.*?StrictEs6ClassTest.ts:95:37/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if second in order expectation is called out of order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once(), __1.expect(mockedTestInterface.method2StringArgNumberReturn).once());
            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:112:17\n\nActual:\n\tmethod2StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6ClassTest.ts:119:37/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if previous in order call is called out of order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once(), __1.expect(mockedTestInterface.method2StringArgNumberReturn).once());
            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /method1NumberArgNumberReturn\(10\) was called but no expectation matched.\nExpectations:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 1.\n\tExpectation set at .*?StrictEs6ClassTest.ts:134:17/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw on out of order calls from two different mocks", () => {
            const mockInterface1 = __1.mock(TestClass_1.TestClass);
            const mockInterface2 = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockInterface1.method1StringArgNumberReturn).once(), __1.expect(mockInterface2.method1StringArgNumberReturn).once());
            let didThrow = false;
            try {
                mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockInterface1.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:158:17\n\nActual:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6ClassTest.ts:164:32/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("supports outputing named parent mock", () => {
            const mockInterface1 = __1.mock(TestClass_1.TestClass, "mockInterface1");
            const mockInterface2 = __1.mock(TestClass_1.TestClass, "mockInterface2");
            __1.inOrder(__1.expect(mockInterface1.method1StringArgNumberReturn).once(), __1.expect(mockInterface2.method1StringArgNumberReturn).once());
            let didThrow = false;
            try {
                mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockInterface1.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmockInterface1.method1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:179:17\n\nActual:\n\tmockInterface2.method1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6ClassTest.ts:185:32/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if less than atLeast expectation", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            let didThrow = false;
            try {
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Expected at least 3 invocations, got 2.\nExpected at: .*?StrictEs6ClassTest.ts:198:13\nCalled at:\n.*?StrictEs6ClassTest.ts:200:33\n.*?StrictEs6ClassTest.ts:201:33/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if less than atMost expectation", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /method1NumberArgNumberReturn\(10\) was called but no expectation matched.\nExpectations:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected between 0 and 3 invocations, so far 3.\n\tExpectation set at .*?StrictEs6ClassTest.ts:217:13/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if atLeast value is negative", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atLeast(-1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /Start value must be >= 0. Received -1/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if atMost value is negative", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(-1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /End value must be >= 1. Received -1/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if atMost value is less than atLeast, atMost first", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(1).atLeast(2);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /Start must be <= end. Start: 2 End: 1/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if atMost value is less than atLeast, atLeast first", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atLeast(2).atMost(1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /Start must be <= end. Start: 2 End: 1/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should throw if atMost value is zero", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(0);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /End value must be >= 1. Received 0/);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("throws if an invalid mock is passed", () => {
            const realObject = () => { };
            let didThrow = true;
            try {
                __1.expect(realObject).once();
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Passed an object that was not a mock. Object: \(\) => { }/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should return mocked value", () => {
            const mockedTestClass = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).once();
            umbra_assert_1.assert.equal(mockedTestClass.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestClass);
        });
        it("should return mocked value", () => {
            const mockedTestClass = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestClass.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestClass.method1StringArgNumberReturn);
        });
        it("should resolved mocked value", () => {
            const mockedTestClass = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestClass.methodNoArgPromiseReturn).andResolve(MOCK_RETURN_VALUE);
            const promise = mockedTestClass.methodNoArgPromiseReturn()
                .then((value) => {
                umbra_assert_1.assert.equal(value, MOCK_RETURN_VALUE);
            });
            __1.verify(mockedTestClass.methodNoArgPromiseReturn);
            return promise;
        });
        it("should reject mocked error", () => {
            const mockedTestClass = __1.mock(TestClass_1.TestClass);
            const expectedError = new Error("error");
            __1.expect(mockedTestClass.methodNoArgPromiseReturn).andReject(expectedError);
            const promise = mockedTestClass.methodNoArgPromiseReturn()
                .then((value) => {
                umbra_assert_1.assert.fail("Should not succeed");
            }).catch((error) => {
                umbra_assert_1.assert.equal(error, expectedError);
            });
            __1.verify(mockedTestClass.methodNoArgPromiseReturn);
            return promise;
        });
        it("should throw if no expectation is set", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.equal(e.message, `method1StringArgNumberReturn("callParam1") was called but no expectation was set.`);
            }
            umbra_assert_1.assert.equal(didThrow, true);
        });
        it("should return mocked value", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
        it("should return mocked value twice", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).times(2);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
        it("should work correctly when class is not provided", () => {
            const mockedTestInterface = __1.mock();
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
        it("should work correctly an invalid method is called when class is not provided", () => {
            const mockedTestInterface = __1.mock();
            __1.expect(mockedTestInterface.invalidMethod).andReturn(MOCK_RETURN_VALUE);
            umbra_assert_1.assert.equal(mockedTestInterface.invalidMethod(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
        it("should throw when invalid method function is called", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            let didThrow = false;
            try {
                mockedTestInterface.invalidMethod(STRING_CALL_PARAM_1);
            }
            catch (e) {
                umbra_assert_1.assert.equal(e.message.indexOf(`Method "invalidMethod" was called on class "TestClass". Ensure method exists on prototype. `), 0);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
            didThrow = false;
            try {
                __1.verify(mockedTestInterface);
            }
            catch (e) {
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw when invalid method expection is set", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            let didThrow = false;
            try {
                __1.expect(mockedTestInterface.invalidMethod).andReturn(MOCK_RETURN_VALUE);
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.equal(e.message.indexOf(`Method "invalidMethod" was called on class "TestClass". Ensure method exists on prototype. `), 0);
            }
            umbra_assert_1.assert.equal(true, didThrow);
            __1.verify(mockedTestInterface);
        });
        it("should allow individual in order expectations", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once(), __1.expect(mockedTestInterface.method2StringArgNumberReturn).once());
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should not throw if non in order expectation is called first", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once());
            __1.expect(mockedTestInterface.method2StringArgNumberReturn).once(),
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should not throw if non in order expectation is set first", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method2StringArgNumberReturn).once();
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once());
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should not throw if non in order expectation is called last", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once());
            __1.expect(mockedTestInterface.method2StringArgNumberReturn).once(),
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should allow in order calls from two different mocks", () => {
            const mockInterface1 = __1.mock(TestClass_1.TestClass);
            const mockInterface2 = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockInterface1.method1NumberArgNumberReturn).once(), __1.expect(mockInterface2.method1StringArgNumberReturn).once());
            mockInterface1.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            __1.verify(mockInterface1, mockInterface2);
        });
        it("should not throw if non in order expectation is in between in order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.inOrder(__1.expect(mockedTestInterface.method1NumberArgNumberReturn).once(), __1.expect(mockedTestInterface.method1StringArgNumberReturn).once());
            __1.expect(mockedTestInterface.method2StringArgNumberReturn).once();
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should throw an exception when using `andThrow`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            const exception = new Error("Test error");
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andThrow(exception);
            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            }
            catch (e) {
                umbra_assert_1.assert.equal(exception, e);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
            __1.verify();
        });
        it("should verify atLeast expectation", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
        it("should verify atMost expectation", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            __1.verify(mockedTestInterface);
        });
    });
    describe("spy", () => {
        it("should return spied value", () => {
            const mockedTestInterface = __1.spy(new TestClass_1.TestClass());
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(__1.any()).andCallRealMethod();
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), TestClass_1.REAL_NUMBER_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
        it("should call through to the real method if specified", () => {
            const mockedTestInterface = __1.spy(new TestClass_1.TestClass());
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(__1.any()).andCallRealMethod();
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), TestClass_1.REAL_NUMBER_RETURN_VALUE);
            __1.verify(mockedTestInterface);
        });
    });
});
//# sourceMappingURL=StrictEs6ClassTest.js.map