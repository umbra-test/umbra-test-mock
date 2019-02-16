import { mock, verify, expect, spy, any } from "../src/index";
import { assert } from "chai";
import { TestClass, REAL_RETURN_VALUE } from "./TestClass";
import "mocha";

const MOCK_RETURN_VALUE = 200;
const CALL_PARAM_1 = "callParam1";

describe("ES6 class strict test cases", () => {

    describe("mock", () => {
        it("should return mocked value", () => {
            const mockedTestClass: TestClass = mock(TestClass);

            expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE).once();
            
            assert.equal(mockedTestClass.method1StringArgNumberReturn(CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestClass);
        });

        it("should return mocked value", () => {
            const mockedTestClass = mock(TestClass);

            expect(mockedTestClass.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            
            assert.equal(mockedTestClass.method1StringArgNumberReturn(CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestClass.method1StringArgNumberReturn);
        });

        it("should throw if no expectation is set", () => {
            const mockedTestInterface = mock(TestClass);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message, "method1StringArgNumberReturn(callParam1) was called but no expectation was set");
            }

            assert.equal(didThrow, true);
        });

        it("should fail if no expectation matches and print the expectations", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("randoString").andReturn(REAL_RETURN_VALUE);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("callPraam1").andReturn(-1);

            let didThrow = false;
            try {
                mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message, "method1StringArgNumberReturn(callParam1) was called but no expectation matched. Expectations:\nmethod1StringArgNumberReturn(randoString)\nmethod1StringArgNumberReturn(callPraam1)\n")
            }

            assert.equal(didThrow, true);
        });

        it("should fail verify if not called enough times", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(REAL_RETURN_VALUE);

            let didThrow = false;
            try {
                verify(mockedTestInterface);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message, "Expected 1 invocations, got 0");
            }

            assert.equal(didThrow, true);
        });

        it("should return mocked value", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should work correctly when class is not provided", () => {
            const mockedTestInterface = mock<TestClass>();

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1), MOCK_RETURN_VALUE);

            verify(mockedTestInterface);
            
        });

        it("should throw when invalid method function is called", () => {
            const mockedTestInterface: any = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(MOCK_RETURN_VALUE);
            
            let didThrow: boolean = false;
            try {
                mockedTestInterface.invalidMethod(CALL_PARAM_1);
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

            
            let didThrow: boolean = false;
            try {
                expect(mockedTestInterface.invalidMethod).andReturn(MOCK_RETURN_VALUE);
            } catch (e) {
                didThrow = true;
                assert.equal(e.message.indexOf(`Method "invalidMethod" was called on class "TestClass". Ensure method exists on prototype. `), 0);
            }

            assert.equal(true, didThrow);
            verify(mockedTestInterface);
        });
    });
    
    describe("spy", () => {
        it("should return spied value", () => {
            const mockedTestInterface = spy(new TestClass());

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andCallRealMethod();
            
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1), REAL_RETURN_VALUE);

            verify(mockedTestInterface);
        });

        it("should return spied value", () => {
            const mockedTestInterface = spy(new TestClass());

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andCallRealMethod();
            
            assert.equal(mockedTestInterface.method1StringArgNumberReturn(CALL_PARAM_1), REAL_RETURN_VALUE);

            verify(mockedTestInterface);
        });
    });

});
