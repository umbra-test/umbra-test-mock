"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const umbra_util_1 = require("umbra-util");
const TestClass_1 = require("./TestClass");
const umbra_assert_1 = require("umbra-assert");
require("mocha");
describe("Argument validator test cases", () => {
    describe("1 arg overrides", () => {
        it("should return correct values when called in order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andStubReturn(1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);
            __1.verify(mockedTestInterface);
        });
        it("should return correct values when called out of order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andStubReturn(1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            __1.verify(mockedTestInterface);
        });
        it("should prefer the more specific version when given a default", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);
            __1.verify(mockedTestInterface);
        });
        it("Handles any value for `any` matcher", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(umbra_util_1.any()).andStubReturn(0);
            __1.expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReturn(-1);
            for (let val of ["0", "1", null, undefined, "", 0, 1, {}, { "object": true }, true, false, function () { }]) {
                umbra_assert_1.assert.equal(mockedTestInterface.method1AnyArgNumberReturn(val), 0);
            }
            __1.verify(mockedTestInterface);
        });
        it("should prefer the more specific matchers over `any` version in order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(-1);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.any()).andStubReturn(0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);
            __1.verify(mockedTestInterface);
        });
        it("should prefer the more specific matchers over `any` version out of order", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.any()).andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);
            __1.verify(mockedTestInterface);
        });
        it("should prefer the more specific `any` version when given a default", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.any()).andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);
            __1.verify(mockedTestInterface);
        });
        it("handles basic any `matcher`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(umbra_util_1.matcher((val) => val === "0")).andStubReturn(0);
            __1.expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1AnyArgNumberReturn("0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1AnyArgNumberReturn(0), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1AnyArgNumberReturn("1"), -1);
            __1.verify(mockedTestInterface);
        });
        it("handles basic string `matcher`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.matcher((val) => val === "0")).andStubReturn(0);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("-0"), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("-1"), -1);
            __1.verify(mockedTestInterface);
        });
        it("handles `gt`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(umbra_util_1.gt(5)).andStubReturn(1);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);
            for (let i = -50; i < 50; i++) {
                umbra_assert_1.assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i > 5 ? 1 : 0);
            }
            __1.verify(mockedTestInterface);
        });
        it("handles `gte`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(umbra_util_1.gte(5)).andStubReturn(1);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);
            for (let i = -50; i < 50; i++) {
                umbra_assert_1.assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i >= 5 ? 1 : 0);
            }
            __1.verify(mockedTestInterface);
        });
        it("handles `lt`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(umbra_util_1.lt(5)).andStubReturn(1);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);
            for (let i = -50; i < 50; i++) {
                umbra_assert_1.assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i < 5 ? 1 : 0);
            }
            __1.verify(mockedTestInterface);
        });
        it("handles `lte`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(umbra_util_1.lte(5)).andStubReturn(1);
            __1.expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);
            for (let i = -50; i < 50; i++) {
                umbra_assert_1.assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i <= 5 ? 1 : 0);
            }
            __1.verify(mockedTestInterface);
        });
        it("handles `startsWith`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.startsWith("blah")).andReturn(1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("blah12345"), 1);
            __1.verify(mockedTestInterface);
        });
        it("handles `regexMatcher`", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(umbra_util_1.regexMatches(/^blah\d+/)).andReturn(1);
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(0);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("blah12345"), 1);
            umbra_assert_1.assert.equal(mockedTestInterface.method1StringArgNumberReturn("abigblah12345"), 0);
            __1.verify(mockedTestInterface);
        });
    });
    describe("2 arg overrides", () => {
        it("handles one string `matcher` one regular string", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method2StringArgNumberReturn)
                .withArgs(umbra_util_1.matcher((val) => val === "0"), "1")
                .andStubReturn(0);
            __1.expect(mockedTestInterface.method2StringArgNumberReturn).andStubReturn(-1);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "1"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "0"), -1);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringArgNumberReturn("1", "1"), -1);
            __1.verify(mockedTestInterface);
        });
        it("matches the most most eligible expectation", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(umbra_util_1.any()).andStubReturn(4);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(umbra_util_1.any(), umbra_util_1.any()).andStubReturn(0);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", "0").andStubReturn(2);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", umbra_util_1.regexMatches(/^1/))
                .andStubReturn(3);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("0", "2").andStubReturn(1);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "2"), 1);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "1"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "0"), 0);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1", "1"), 3);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1"), 4);
            __1.verify(mockedTestInterface);
        });
        it("Equal precedence matchers fall back to ordering", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(umbra_util_1.any(), "0").andStubReturn(0);
            __1.expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", umbra_util_1.any()).andStubReturn(1);
            umbra_assert_1.assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1", "0"), 0);
            __1.verify(mockedTestInterface);
        });
    });
});
//# sourceMappingURL=ArgumentValidatorTest.js.map