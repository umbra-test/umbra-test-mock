import { mock, reset, verify, expect, partialMock, any, inOrder, Answer, eq } from "..";
import { assert } from "umbra-assert";
import { TestClass, REAL_NUMBER_RETURN_VALUE } from "./TestClass";
import * as os from "os";
import * as process from "process";

const MOCK_RETURN_VALUE = 100;
const NUMBER_CALL_PARAM_1 = 10;
const STRING_CALL_PARAM_1 = "callParam1";
describe("ES6 class strict test cases", () => {

    describe("mock", () => {
        // Putting all the error messages first
        it("should throw if the expectation already matched its count", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).once();

            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 1.\n\tExpectation set at .*?StrictEs6Class.test.ts:17:13/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should fail if no expectation matches and print the expectations", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("randoString").andReturn(REAL_NUMBER_RETURN_VALUE);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("callPraam1").andReturn(-1);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\("randoString"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:36:13\n\n\tmethod1StringArgNumberReturn\("callPraam1"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:37:13\n/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should fail verify if not called enough times", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(REAL_NUMBER_RETURN_VALUE);

            let didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\nExpected at: .*?StrictEs6Class.test\.ts:54:13/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should throw if mocked value is not called three times when expected", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).times(3);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            let didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Expected 3 invocations, got 2.\nExpected at: .*?StrictEs6Class.test\.ts:71:13\nCalled at:\n.*?StrictEs6Class.test\.ts:73:46\n.*?StrictEs6Class.test\.ts:74:46\n/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should throw if first in order expectation is called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            let didThrow = false;
            try {
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:92:17\n\nActual:\n\tmethod2StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at.*?StrictEs6Class.test.ts:99:37/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if second in order expectation is called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:117:17\n\nActual:\n\tmethod2StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6Class.test.ts:124:37/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if previous in order call is called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /method1NumberArgNumberReturn\(10\) was called but no expectation matched.\nExpectations:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 1.\n\tExpectation set at .*?StrictEs6Class.test.ts:140:17/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw on out of order calls from two different mocks", () => {
            const mockInterface1 = mock(TestClass);
            const mockInterface2 = mock(TestClass);

            inOrder(
                expect(mockInterface1.method1StringArgNumberReturn).once(),
                expect(mockInterface2.method1StringArgNumberReturn).once(),
            );

            let didThrow = false;
            try {
                mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockInterface1.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:165:17\n\nActual:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6Class.test.ts:171:32/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockInterface1, mockInterface2);
        });

        it("supports outputing named parent mock", () => {
            const mockInterface1 = mock(TestClass, "mockInterface1");
            const mockInterface2 = mock(TestClass, "mockInterface2");

            inOrder(
                expect(mockInterface1.method1StringArgNumberReturn).once(),
                expect(mockInterface2.method1StringArgNumberReturn).once(),
            );

            let didThrow = false;
            try {
                mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockInterface1.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmockInterface1.method1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test\.ts:187:17\n\nActual:\n\tmockInterface2.method1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tCalled at .*?StrictEs6Class.test.ts:193:32/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockInterface1, mockInterface2);
        });

        it("should throw if less than atLeast expectation", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            let didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /Expected at least 3 invocations, got 2.\nExpected at: .*?StrictEs6Class.test.ts:207:13\nCalled at:\n.*?StrictEs6Class.test.ts:209:33\n.*?StrictEs6Class.test.ts:210:33/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if less than atMost expectation", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            let didThrow = false;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            } catch (e) {
                assert.regexMatches(e.message, /method1NumberArgNumberReturn\(10\) was called but no expectation matched.\nExpectations:\n\tmethod1NumberArgNumberReturn\(\) with any arguments. Expected between 0 and 3 invocations, so far 3.\n\tExpectation set at .*?StrictEs6Class.test.ts:227:13/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("Handles mocks in expected arg names when error is thrown", () => {
            const testClass: TestClass = mock();
            const arg1: TestClass = mock();

            expect(testClass.method1AnyArgNumberReturn).withArgs(arg1);

            let didThrow = false;
            try {
                testClass.method1AnyArgNumberReturn(null);
            } catch (e) {
                assert.regexMatches(e.message, /method1AnyArgNumberReturn\(null\) was called but no expectation matched.\nExpectations:\n\tmethod1AnyArgNumberReturn\(mock\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6Class.test.ts:248:13/)
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(testClass, arg1);
        });

        it("should throw if atMost is called twice", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3).atMost(4);
            } catch (e) {
                assert.regexMatches(e.message, /Previously set expectation count, value must only be set once/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("should throw if atLeast is called twice", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3).atLeast(4);
            } catch (e) {
                assert.regexMatches(e.message, /Previously set expectation count, value must only be set once/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if times is called twice", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1NumberArgNumberReturn).times(3).times(4);
            } catch (e) {
                assert.regexMatches(e.message, /Previously set expectation count, value must only be set once/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if times and atLeast is called", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3).times(4);
            } catch (e) {
                assert.regexMatches(e.message, /Previously set expectation count, value must only be set once/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if times and atMost is called", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3).times(4);
            } catch (e) {
                assert.regexMatches(e.message, /Previously set expectation count, value must only be set once/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw if times with no args is called with atLeast with specific args", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").atLeast(4);
                expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").times(6);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Previous expectation had a non fixed range./);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should not throw if times with no args is called with atLeast with differnt args", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").atLeast(4);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("2").times(6);

            reset(mockedTestInterface);
        });


        it("should throw if times is called with atLeast", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atLeast(4);
                expect(mockedTestInterface.method1StringArgNumberReturn).times(2);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Previous expectation had a non fixed range./);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });


        it("should check the specificity of the args when checking ranges", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").atLeast(4);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("2").times(2);
            // verify does not throw

            reset(mockedTestInterface);
        });

        it("should throw if atLeast value is negative", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atLeast(-1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Start value must be >= 0. Received -1/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should throw if atMost value is negative", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(-1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /End value must be >= 1. Received -1/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });


        it("should throw if atMost value is less than atLeast, atMost first", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(1).atLeast(2);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Start must be <= end. Start: 2 End: 1/);
            }

            assert.equal(didThrow, true);
        });

        it("should throw if atMost value is less than atLeast, atLeast first", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atLeast(2).atMost(1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Start must be <= end. Start: 2 End: 1/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("should throw if atMost value is zero", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).atMost(0);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /End value must be >= 1. Received 0/);
            }

            assert.equal(didThrow, true);
            reset(mockedTestInterface);
        });

        it("throws if an invalid mock is passed", () => {
            const realObject = () => { };


            let didThrow = false;
            try {
                expect(realObject).once();
            } catch (e) {
                assert.regexMatches(e.message, new RegExp(`Passed an object that was not a mock. Object: ${realObject.toString().replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')}`));
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("Handles mocks in expected arg names", () => {
            const testClass: TestClass = mock();
            const arg1: TestClass = mock();

            expect(testClass.method1AnyArgNumberReturn).withArgs(arg1);

            testClass.method1AnyArgNumberReturn(arg1);

            verify(testClass, arg1);
        });

        it("Handles binding mock functions", () => {
            const testClass: TestClass = mock();
            const arg1: TestClass = mock();

            const expected = 20;
            expect(testClass.method1AnyArgNumberReturn).withArgs(arg1).andReturn(expected);

            const boundFunction = testClass.method1AnyArgNumberReturn.bind(undefined, arg1);
            const output = boundFunction();

            assert.equal(expected, output);

            verify(testClass, arg1);
        });

        it("Handles binding mock functions 2", () => {
            const testClass: TestClass = mock();

            const expected = "30";
            expect(testClass.method1AnyArgStringReturn).withArgs("arg1").andReturn(expected);

            const boundFunction = testClass.method1AnyArgStringReturn.bind(undefined, "arg1");
            const output = "testString30000".replace("test", boundFunction());

            assert.equal("30String30000", output);

            verify(testClass);
        });

        it("should return mocked value", () => {
            const mockedTestClass: TestClass = mock(TestClass);

            expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).once();

            assert.equal(mockedTestClass.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestClass);
        });

        it("should return mocked value", () => {
            const mockedTestClass = mock(TestClass);

            expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestClass.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestClass.method1StringArgNumberReturn);
        });

        it("should resolved mocked value", () => {
            const mockedTestClass = mock(TestClass);

            expect(mockedTestClass.methodNoArgPromiseReturn).andResolve(MOCK_RETURN_VALUE);

            const promise = mockedTestClass.methodNoArgPromiseReturn()
                .then((value: number) => {
                    assert.equal(value, MOCK_RETURN_VALUE);
                });


            verify(mockedTestClass.methodNoArgPromiseReturn);
            return promise;
        });

        it("should reject mocked error", () => {
            const mockedTestClass = mock(TestClass);

            const expectedError = new Error("error");
            expect(mockedTestClass.methodNoArgPromiseReturn).andReject(expectedError);

            const promise = mockedTestClass.methodNoArgPromiseReturn()
                .then((value: number) => {
                    assert.fail("Should not succeed");
                }).catch((error: Error) => {
                    assert.equal(error, expectedError);
                });


            verify(mockedTestClass.methodNoArgPromiseReturn);
            return promise;
        });

        it("should throw if no expectation is set", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message, `method1StringArgNumberReturn("callParam1") was called but no expectation was set.`);
            }

            assert.equal(didThrow, true);
        });

        it("should return mocked value", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should return mocked value twice", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).times(2);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should work correctly when class is not provided", () => {
            const mockedTestInterface = mock<TestClass>();

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });


        it("should work correctly an invalid method is called when class is not provided", () => {
            const mockedTestInterface: any = mock<TestClass>();

            expect(mockedTestInterface.invalidMethod).andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestInterface.invalidMethod(STRING_CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should throw when invalid method function is called", () => {
            const mockedTestInterface: any = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);

            let didThrow = false;
            try {
                mockedTestInterface.invalidMethod(STRING_CALL_PARAM_1);
            } catch (e) {
                assert.equal(e.message.indexOf(`Method "invalidMethod" was called on class "TestClass". Ensure method exists on prototype. `), 0);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedTestInterface);
        });

        it("should throw when invalid method expection is set", () => {
            const mockedTestInterface: any = mock(TestClass);


            let didThrow = false;
            try {
                expect(mockedTestInterface.invalidMethod).andReturn(MOCK_RETURN_VALUE);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message.indexOf(`Method "invalidMethod" was called on class "TestClass". Ensure method exists on prototype. `), 0);
            }

            assert.equal(true, didThrow);
            verify(mockedTestInterface);
        });

        it("should allow individual in order expectations", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);

            verify(mockedTestInterface);
        });

        it("should not throw if non in order expectation is called first", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
            );

            expect(mockedTestInterface.method2StringArgNumberReturn).once(),

                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);

            verify(mockedTestInterface);
        });

        it("should not throw if non in order expectation is set first", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringArgNumberReturn).once();
            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once()
            );

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);

            verify(mockedTestInterface);
        });


        it("should not throw if non in order expectation is called last", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
            );

            expect(mockedTestInterface.method2StringArgNumberReturn).once(),

                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);

            verify(mockedTestInterface);
        });

        it("should allow in order calls from two different mocks", () => {
            const mockInterface1 = mock(TestClass);
            const mockInterface2 = mock(TestClass);

            inOrder(
                expect(mockInterface1.method1NumberArgNumberReturn).once(),
                expect(mockInterface2.method1StringArgNumberReturn).once(),
            );

            mockInterface1.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockInterface2.method1StringArgNumberReturn(STRING_CALL_PARAM_1);

            verify(mockInterface1, mockInterface2);
        });

        it("should not throw if non in order expectation is in between in order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
            );

            expect(mockedTestInterface.method2StringArgNumberReturn).once();

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);

            verify(mockedTestInterface);
        });


        it("should throw an exception when using `andThrow`", () => {
            const mockedTestInterface = mock(TestClass);

            const exception = new Error("Test error");
            expect(mockedTestInterface.method1StringArgNumberReturn).andThrow(exception);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                assert.equal(exception, e);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            verify();
        });

        it("should verify atLeast expectation", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).atLeast(3);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            verify(mockedTestInterface);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            verify(mockedTestInterface);
        });

        it("should verify atMost expectation", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).atMost(3);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            verify(mockedTestInterface);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            verify(mockedTestInterface);

            mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);

            verify(mockedTestInterface);
        });

        it("should handle stubReturn", () => {
            const mockedTestInterface = mock(TestClass);

            const result = 10;
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReturn(result);

            verify(mockedTestInterface);

            const actual = mockedTestInterface.method1AnyArgNumberReturn("");

            assert.equal(result, actual);
            verify(mockedTestInterface);
        });

        it("should handle stubAnswer", () => {
            const mockedTestInterface = mock(TestClass);
            const mockAnswer: Answer<TestClass["method1AnyArgNumberReturn"]> = mock();

            const result = 10;
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubAnswer(mockAnswer);

            verify(mockedTestInterface, mockAnswer);

            expect(mockAnswer).andReturn(result).once();
            const actual = mockedTestInterface.method1AnyArgNumberReturn("");

            assert.equal(result, actual);
            verify(mockedTestInterface, mockAnswer);
        });


        it("should handle stubResolve", () => {
            const mockedTestInterface = mock(TestClass);

            const result = 10;
            expect(mockedTestInterface.methodNoArgPromiseReturn).andStubResolve(result);

            verify(mockedTestInterface);

            return mockedTestInterface.methodNoArgPromiseReturn()
                .then((value) => {
                    assert.equal(value, result);
                    verify(mockedTestInterface);
                });
        });

        it("should handle stubReject", () => {
            const mockedTestInterface = mock(TestClass);

            const result = new Error("huge massive error");
            expect(mockedTestInterface.methodNoArgPromiseReturn).andStubReject(result);

            verify(mockedTestInterface);

            return mockedTestInterface.methodNoArgPromiseReturn()
                .catch((error) => {
                    assert.equal(error, result);
                    verify(mockedTestInterface);
                });
        });

        it("should handle stubResolve", () => {
            const mockedTestInterface = mock(TestClass);

            const result = 10;
            expect(mockedTestInterface.methodNoArgPromiseReturn).andStubResolve(result);

            verify(mockedTestInterface);

            return mockedTestInterface.methodNoArgPromiseReturn()
                .then((value) => {
                    assert.equal(value, result);
                    verify(mockedTestInterface);
                });
        });


        it("should not have a andReturn method if mocked function has a void method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgVoidReturn).andReturn;

            reset(mockedTestInterface);
        });

        it("should not have a andStubReturn method if mocked function has a void method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgVoidReturn).andStubReturn;

            reset(mockedTestInterface);
        });

        it("should not have a andResolve method if mocked function does not return a promise method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgNumberReturn).andResolve;

            reset(mockedTestInterface);
        });

        it("should not have a andStubResolve method if mocked function does not return a promise method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubResolve;

            reset(mockedTestInterface);
        });

        it("should not have a andReject method if mocked function does not return a promise method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgNumberReturn).andReject;

            reset(mockedTestInterface);
        });

        it("should not have a andStubReject method if mocked function does not return a promise method", () => {
            const mockedTestInterface = mock(TestClass);

            // @ts-expect-error 
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReject;

            reset(mockedTestInterface);
        });
    });

    describe("partialMock", () => {

        it("should call through to the real method if specified", () => {
            const mockedTestInterface = partialMock(new TestClass());

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(STRING_CALL_PARAM_1).andCallRealMethod();
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("2").andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), REAL_NUMBER_RETURN_VALUE);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("2"), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should allow mocking static methods", () => {
            const mockedTestInterface = partialMock(TestClass);

            expect(mockedTestInterface.staticMethod1StringArgNumberReturn).withArgs(STRING_CALL_PARAM_1).andCallRealMethod();
            expect(mockedTestInterface.staticMethod1StringArgNumberReturn).withArgs("2").andReturn(MOCK_RETURN_VALUE);

            assert.equal(mockedTestInterface.staticMethod1StringArgNumberReturn(STRING_CALL_PARAM_1), REAL_NUMBER_RETURN_VALUE);
            assert.equal(mockedTestInterface.staticMethod1StringArgNumberReturn("2"), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should automatically call through to unmocked methods", () => {
            const osMock = partialMock(os);

            const expected = "FakeEndian";
            // @ts-expect-error 
            expect(osMock.endianness).andReturn(expected);

            assert.equal(expected, osMock.endianness());
            assert.notEqual(expected, os.endianness());
            assert.equal(process.arch, osMock.arch());
        })
    });

});
