import { mock, verify, expect } from "..";
import { assert } from "umbra-assert";
import "mocha";

interface TestInterface {

    exampleMethod(): string;
}

interface InterfaceFunction {
    (): string;
}

type TestFunction = () => string;
type TestFunctionWithOptionalString = (optionalArg?: string) => string;
type TestFunctionReturnsPromiseString = () => Promise<string>;

const MOCK_RETURN_VAL = "mockReturnVal";

describe("Interface test cases", () => {

    describe("TestInterface", () => {
        it("should return mock value", () => {
            const mockedTestInterface = mock<TestInterface>();

            expect(mockedTestInterface.exampleMethod).andReturn(MOCK_RETURN_VAL);

            assert.equal(MOCK_RETURN_VAL, mockedTestInterface.exampleMethod());

            verify(mockedTestInterface.exampleMethod);
        });
    });

    describe("InterfaceFunction", () => {
        it("should return mock value", () => {
            const mockedTestInterface = mock<InterfaceFunction>();

            expect(mockedTestInterface).withArgs().andReturn(MOCK_RETURN_VAL);

            assert.equal(MOCK_RETURN_VAL, mockedTestInterface());

            verify(mockedTestInterface);
        });
    });

    describe("BasicFunction", () => {
        it("supports named mock in expectation error messages", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>("mockedFunction");

            expect(mockedFunction).withArgs("").andReturn(MOCK_RETURN_VAL);

            let didThrow = true;
            try {
                assert.equal(MOCK_RETURN_VAL, mockedFunction());
            } catch (e) {
                assert.regexMatches(e.message, /mockedFunction\(\) was called but no expectation matched.\nExpectations:\n\tmockedFunction\(""\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:50:13/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("should throw if no args match with optional args", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>();

            expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);

            let didThrow = false;
            try {
                mockedFunction("noMatch");
            } catch (e) {
                didThrow = true;
                assert.regexMatches(e.message, /mock\("noMatch"\) was called but no expectation matched.\nExpectations:\n\tmock\("arg"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:66:13\n\n\tmock\(\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:67:13\n/)
            }

            assert.equal(true, didThrow);
        });

        it("supports named mock in verify error messages", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>("mockedFunction");

            expect(mockedFunction).withArgs("").andReturn(MOCK_RETURN_VAL);

            let didThrow = true;
            try {
                verify(mockedFunction);
            } catch (e) {
                assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\n.*?StrictInterfaceTest.ts:83:13/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
        });

        it("should return mock value", () => {
            const mockedTestInterface = mock<TestFunction>();

            expect(mockedTestInterface).andReturn(MOCK_RETURN_VAL);

            assert.equal(MOCK_RETURN_VAL, mockedTestInterface());

            verify(mockedTestInterface);
        });

        it("should match args correctly with provided optional args", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>();

            expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            expect(mockedFunction).withArgs().andStubReturn(MOCK_RETURN_VAL + 1);

            assert.equal(MOCK_RETURN_VAL, mockedFunction("arg"));

            verify(mockedFunction);
        });

        it("should match args correctly with unspecified optional args", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>();

            expect(mockedFunction).withArgs("arg").andStubReturn(MOCK_RETURN_VAL);
            expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);

            assert.equal(MOCK_RETURN_VAL + 1, mockedFunction());

            verify(mockedFunction);
        });

        it("resolves a promise when specified", () => {
            const mockedFunction = mock<TestFunctionReturnsPromiseString>();

            expect(mockedFunction).andResolve(MOCK_RETURN_VAL);

            return mockedFunction()
                .then((value: string) => {
                    assert.equal(value, MOCK_RETURN_VAL);
                });

        });

        it("rejects a promise when specified", () => {
            const mockedFunction = mock<TestFunctionReturnsPromiseString>();

            const expectedError = new Error("big error");
            expect(mockedFunction).andReject(expectedError);

            return mockedFunction()
                .then(() => {
                    assert.fail("Promise should not succeed");
                }).catch((error: Error) => {
                    assert.equal(error, expectedError);
                });

        });

    });

});