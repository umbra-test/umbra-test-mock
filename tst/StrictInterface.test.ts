import { mock, verify, expect, reset } from "..";
import { assert } from "umbra-assert";

interface TestInterface {

    exampleMethod(): string;
    
}

interface InterfaceFunction {
    (): string;
}

interface FakeEventEmitter {

    on(event: "close", listener: () => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

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

    describe("FakeEventEmitter", () => {
        it("mocks overloaded function correctly", () => {
            const testInterface = mock<FakeEventEmitter>();
            const callback: () => void = mock();
            expect(testInterface.on).withArgs("close", callback);

            reset(testInterface);
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
                assert.regexMatches(e.message, /mockedFunction\(\) was called but no expectation matched.\nExpectations:\n\tmockedFunction\(""\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterface.test.ts:68:13/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedFunction);
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
                assert.regexMatches(e.message, /mock\("noMatch"\) was called but no expectation matched.\nExpectations:\n\tmock\("arg"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterface.test.ts:85:13\n\n\tmock\(\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterface.test.ts:86:13\n/)
            }

            assert.equal(true, didThrow);
            reset(mockedFunction);
        });

        it("supports named mock in verify error messages", () => {
            const mockedFunction = mock<TestFunctionWithOptionalString>("mockedFunction");

            expect(mockedFunction).withArgs("").andReturn(MOCK_RETURN_VAL);

            let didThrow = true;
            try {
                verify(mockedFunction);
            } catch (e) {
                assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\nExpected at: .*?StrictInterface.test.ts:103:13/);
                didThrow = true;
            }

            assert.equal(true, didThrow);
            reset(mockedFunction);
        });

        it("Handles binding mock functions", () => {
            const mockedFunction: InterfaceFunction = mock();
            
            const expected = "30";
            expect(mockedFunction).andReturn(expected);
            
            const boundFunction = mockedFunction.bind(undefined);
            const output = "testString30000".replace("test", boundFunction());

            assert.equal("30String30000", output);

            verify(mockedFunction);
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