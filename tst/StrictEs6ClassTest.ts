import { mock, verify, expect, spy, any, inOrder } from "..";
import { assert } from "umbra-assert";
import { TestClass, REAL_NUMBER_RETURN_VALUE } from "./TestClass";
import "mocha";

const MOCK_RETURN_VALUE = 200;
const NUMBER_CALL_PARAM_1 = 10;
const STRING_CALL_PARAM_1 = "callParam1";

describe("ES6 class strict test cases", () => {

    describe("mock", () => {
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

        it("should throw if the expectation already matched its count", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).once();

            mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 1.\n\tExpectation set at .*?StrictEs6ClassTest.ts:83:13/);
            }

            assert.equal(didThrow, true);
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
                assert.regexMatches(e.message, /method1StringArgNumberReturn\("callParam1"\) was called but no expectation matched.\nExpectations:\n\tmethod1StringArgNumberReturn\("randoString"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:101:13\n\n\tmethod1StringArgNumberReturn\("callPraam1"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:102:13\n/);
            }

            assert.equal(didThrow, true);
        });

        it("should fail verify if not called enough times", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(REAL_NUMBER_RETURN_VALUE);

            let didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\nExpected at: .*?StrictEs6ClassTest\.ts:118:13/);
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
                assert.regexMatches(e.message, /Expected 3 invocations, got 2.\nExpected at: .*?StrictEs6ClassTest\.ts:155:13\nCalled at:\n.*?StrictEs6ClassTest\.ts:157:46\n.*?StrictEs6ClassTest\.ts:158:46\n/);
            }

            assert.equal(didThrow, true);
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

        it("should throw if first in order expectation is called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            let didThrow = true;
            try {
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call. Expected: method1NumberArgNumberReturn\(\) with any arguments.\nExpected at: .*?StrictEs6ClassTest\.ts:232:74/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("should throw if second in order expectation is called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            inOrder(
                expect(mockedTestInterface.method1NumberArgNumberReturn).once(),
                expect(mockedTestInterface.method1StringArgNumberReturn).once(),
                expect(mockedTestInterface.method2StringArgNumberReturn).once(),
            );

            let didThrow = true;
            try {
                mockedTestInterface.method1NumberArgNumberReturn(NUMBER_CALL_PARAM_1);
                mockedTestInterface.method2StringArgNumberReturn(STRING_CALL_PARAM_1, STRING_CALL_PARAM_1);
                mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1);
                verify(mockedTestInterface);
            } catch (e) {
                assert.regexMatches(e.message, /Out of order method call.\nExpected:\n\tmethod1StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest\.ts:274:17\n\nActual:\n\tmethod2StringArgNumberReturn\(\) with any arguments. Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictEs6ClassTest.ts:281:37/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
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
    });

    describe("spy", () => {
        it("should return spied value", () => {
            const mockedTestInterface = spy(new TestClass());

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andCallRealMethod();

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), REAL_NUMBER_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should call through to the real method if specified", () => {
            const mockedTestInterface = spy(new TestClass());

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andCallRealMethod();

            assert.equal(mockedTestInterface.method1StringArgNumberReturn(STRING_CALL_PARAM_1), REAL_NUMBER_RETURN_VALUE);

            verify(mockedTestInterface);
        });
    });

});
