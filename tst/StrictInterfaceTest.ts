import { mock, verify, expect } from "../src/index";
import { assert } from "chai";
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
        it("should return mock value", () => {
            const mockedTestInterface = mock<TestFunction>();

            expect(mockedTestInterface).andReturn(MOCK_RETURN_VAL);

            assert.equal(MOCK_RETURN_VAL, mockedTestInterface());

            verify(mockedTestInterface);
        });

        it("should match args correctly with provided optional args", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>();

            expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);

            assert.equal(MOCK_RETURN_VAL, mockedFunction("arg"));

            verify(mockedFunction);
        });

        it("should match args correctly with unspecified optional args", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>();

            expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);

            assert.equal(MOCK_RETURN_VAL + 1, mockedFunction());

            verify(mockedFunction);
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
                assert.equal(0, e.message.indexOf("func(noMatch) was called but no expectation matched."))
            }

            assert.equal(true, didThrow);
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