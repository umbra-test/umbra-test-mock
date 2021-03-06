import { mock, expect, verify } from ".."
import { any, matcher, gt, gte, lt, lte, startsWith, regexMatches } from "@umbra-test/umbra-util";
import { TestClass } from "./TestClass";
import { assert } from "umbra-assert";

describe("Argument validator test cases", () => {

    describe("1 arg overrides", () => {
        it("should return correct values when called in order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andStubReturn(1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);

            verify(mockedTestInterface);
        });

        it("should return correct values when called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andStubReturn(1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);

            verify(mockedTestInterface);
        });

        it("should prefer the more specific version when given a default", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);

            verify(mockedTestInterface);
        });

        it("Handles any value for `any` matcher", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(any()).andStubReturn(0);
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReturn(-1);

            for (let val of ["0", "1", null, undefined, "", 0, 1, {}, { "object": true }, true, false, function () { }]) {
                assert.equal(mockedTestInterface.method1AnyArgNumberReturn(val), 0);
            }

            verify(mockedTestInterface);
        });

        it("should prefer the more specific matchers over `any` version in order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(-1);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andStubReturn(0);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);

            verify(mockedTestInterface);
        });


        it("should prefer the more specific matchers over `any` version out of order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andStubReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);

            verify(mockedTestInterface);
        });

        it("should prefer the more specific `any` version when given a default", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);

            verify(mockedTestInterface);
        });

        it("handles basic any `matcher`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(matcher((val: any) => val === "0")).andStubReturn(0);
            expect(mockedTestInterface.method1AnyArgNumberReturn).andStubReturn(-1);

            assert.equal(mockedTestInterface.method1AnyArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1AnyArgNumberReturn(0), -1);
            assert.equal(mockedTestInterface.method1AnyArgNumberReturn("1"), -1);

            verify(mockedTestInterface);
        });

        it("handles basic string `matcher`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(matcher((val: string) => val === "0")).andStubReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andStubReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("-0"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("-1"), -1);

            verify(mockedTestInterface);
        });

        it("handles `gt`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(gt(5)).andStubReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i > 5 ? 1 : 0);
            }

            verify(mockedTestInterface);
        });

        it("handles `gte`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(gte(5)).andStubReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i >= 5 ? 1 : 0);
            }

            verify(mockedTestInterface);
        });

        it("handles `lt`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(lt(5)).andStubReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i < 5 ? 1 : 0);
            }

            verify(mockedTestInterface);
        });

        it("handles `lte`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(lte(5)).andStubReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andStubReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i <= 5 ? 1 : 0);
            }

            verify(mockedTestInterface);
        });

        it("handles `startsWith`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(startsWith("blah")).andReturn(1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("blah12345"), 1);

            verify(mockedTestInterface);
        });


        it("handles `regexMatcher`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(regexMatches(/^blah\d+/)).andReturn(1);
            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(0);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("blah12345"), 1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("abigblah12345"), 0);

            verify(mockedTestInterface);
        });

    });

    describe("2 arg overrides", () => {
        it("handles one string `matcher` one regular string", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringArgNumberReturn)
                .withArgs(matcher((val: string) => val === "0"), "1")
                .andStubReturn(0);
            expect(mockedTestInterface.method2StringArgNumberReturn).andStubReturn(-1);

            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "1"), 0);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "0"), -1);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("1", "1"), -1);

            verify(mockedTestInterface);
        });

        it("matches the most most eligible expectation", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(any()).andStubReturn(4);
            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(any(), any()).andStubReturn(0);
            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", "0").andStubReturn(2);
            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", regexMatches(/^1/))
                .andStubReturn(3);
            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("0", "2").andStubReturn(1);

            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "2"), 1);
            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "1"), 0);
            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("0", "0"), 0);
            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1", "1"), 3);
            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1"), 4);

            verify(mockedTestInterface);
        });

        it("Equal precedence matchers fall back to ordering", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs(any(), "0").andStubReturn(0);
            expect(mockedTestInterface.method2StringOptionalArgNumberReturn).withArgs("1", any()).andStubReturn(1);

            assert.equal(mockedTestInterface.method2StringOptionalArgNumberReturn("1", "0"), 0);

            verify(mockedTestInterface);
        });
    })

});