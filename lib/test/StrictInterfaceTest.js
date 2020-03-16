"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const umbra_assert_1 = require("umbra-assert");
require("mocha");
const MOCK_RETURN_VAL = "mockReturnVal";
describe("Interface test cases", () => {
    describe("TestInterface", () => {
        it("should return mock value", () => {
            const mockedTestInterface = __1.mock();
            __1.expect(mockedTestInterface.exampleMethod).andReturn(MOCK_RETURN_VAL);
            umbra_assert_1.assert.equal(MOCK_RETURN_VAL, mockedTestInterface.exampleMethod());
            __1.verify(mockedTestInterface.exampleMethod);
        });
    });
    describe("InterfaceFunction", () => {
        it("should return mock value", () => {
            const mockedTestInterface = __1.mock();
            __1.expect(mockedTestInterface).withArgs().andReturn(MOCK_RETURN_VAL);
            umbra_assert_1.assert.equal(MOCK_RETURN_VAL, mockedTestInterface());
            __1.verify(mockedTestInterface);
        });
    });
    describe("BasicFunction", () => {
        it("supports named mock in expectation error messages", () => {
            const mockedFunction = __1.mock("mockedFunction");
            __1.expect(mockedFunction).withArgs("").andReturn(MOCK_RETURN_VAL);
            let didThrow = true;
            try {
                umbra_assert_1.assert.equal(MOCK_RETURN_VAL, mockedFunction());
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /mockedFunction\(\) was called but no expectation matched.\nExpectations:\n\tmockedFunction\(""\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:50:13/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should throw if no args match with optional args", () => {
            const mockedFunction = __1.mock();
            __1.expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            __1.expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);
            let didThrow = false;
            try {
                mockedFunction("noMatch");
            }
            catch (e) {
                didThrow = true;
                umbra_assert_1.assert.regexMatches(e.message, /mock\("noMatch"\) was called but no expectation matched.\nExpectations:\n\tmock\("arg"\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:66:13\n\n\tmock\(\). Expected 1 invocations, so far 0.\n\tExpectation set at .*?StrictInterfaceTest.ts:67:13\n/);
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("supports named mock in verify error messages", () => {
            const mockedFunction = __1.mock("mockedFunction");
            __1.expect(mockedFunction).withArgs("").andReturn(MOCK_RETURN_VAL);
            let didThrow = true;
            try {
                __1.verify(mockedFunction);
            }
            catch (e) {
                umbra_assert_1.assert.regexMatches(e.message, /Expected 1 invocations, got 0\.\n.*?StrictInterfaceTest.ts:83:13/);
                didThrow = true;
            }
            umbra_assert_1.assert.equal(true, didThrow);
        });
        it("should return mock value", () => {
            const mockedTestInterface = __1.mock();
            __1.expect(mockedTestInterface).andReturn(MOCK_RETURN_VAL);
            umbra_assert_1.assert.equal(MOCK_RETURN_VAL, mockedTestInterface());
            __1.verify(mockedTestInterface);
        });
        it("should match args correctly with provided optional args", () => {
            const mockedFunction = __1.mock();
            __1.expect(mockedFunction).withArgs("arg").andReturn(MOCK_RETURN_VAL);
            __1.expect(mockedFunction).withArgs().andStubReturn(MOCK_RETURN_VAL + 1);
            umbra_assert_1.assert.equal(MOCK_RETURN_VAL, mockedFunction("arg"));
            __1.verify(mockedFunction);
        });
        it("should match args correctly with unspecified optional args", () => {
            const mockedFunction = __1.mock();
            __1.expect(mockedFunction).withArgs("arg").andStubReturn(MOCK_RETURN_VAL);
            __1.expect(mockedFunction).withArgs().andReturn(MOCK_RETURN_VAL + 1);
            umbra_assert_1.assert.equal(MOCK_RETURN_VAL + 1, mockedFunction());
            __1.verify(mockedFunction);
        });
        it("resolves a promise when specified", () => {
            const mockedFunction = __1.mock();
            __1.expect(mockedFunction).andResolve(MOCK_RETURN_VAL);
            return mockedFunction()
                .then((value) => {
                umbra_assert_1.assert.equal(value, MOCK_RETURN_VAL);
            });
        });
        it("rejects a promise when specified", () => {
            const mockedFunction = __1.mock();
            const expectedError = new Error("big error");
            __1.expect(mockedFunction).andReject(expectedError);
            return mockedFunction()
                .then(() => {
                umbra_assert_1.assert.fail("Promise should not succeed");
            }).catch((error) => {
                umbra_assert_1.assert.equal(error, expectedError);
            });
        });
    });
});
//# sourceMappingURL=StrictInterfaceTest.js.map