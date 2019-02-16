import { mock, expect, any, matcher, gt, gte, lt, lte } from "../src/index";
import { TestClass } from "./TestClass";
import { assert } from "chai";
import "mocha";

describe("Argument validator test cases", () => {

    describe("1 arg overrides", () => {
        it("should return correct values when called in order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andReturn(1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);
        });

        it("should return correct values when called out of order", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("1").andReturn(1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
        });

        it("should prefer the more specific version when given a default", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs("0").andReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);
        });

        it("Handles any value for `any` matcher", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(any()).andReturn(0);
            expect(mockedTestInterface.method1AnyArgNumberReturn).andReturn(-1);

            for (let val of ["0", "1", null, undefined, "", 0, 1, {}, { "object": true }]) {
                assert.equal(mockedTestInterface.method1AnyArgNumberReturn(val), 0);
            }
        });

        it("should prefer the more specific `any` version when given a default", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(any()).andReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), 0);
        });

        it("handles basic any `matcher`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1AnyArgNumberReturn).withArgs(matcher((val: any) => val === "0")).andReturn(0);
            expect(mockedTestInterface.method1AnyArgNumberReturn).andReturn(-1);

            assert.equal(mockedTestInterface.method1AnyArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1AnyArgNumberReturn(0), -1);
            assert.equal(mockedTestInterface.method1AnyArgNumberReturn("1"), -1);
        });

        it("handles basic string `matcher`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(matcher((val: string) => val === "0")).andReturn(0);
            expect(mockedTestInterface.method1StringArgNumberReturn).andReturn(-1);

            assert.equal(mockedTestInterface.method1StringArgNumberReturn("0"), 0);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("1"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("-0"), -1);
            assert.equal(mockedTestInterface.method1StringArgNumberReturn("-1"), -1);
        });

        it("handles `gt`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(gt(5)).andReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i > 5 ? 1 : 0);
            }
        });

        it("handles `gte`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(gte(5)).andReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i >= 5 ? 1 : 0);
            }
        });

        it("handles `lt`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(lt(5)).andReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i < 5 ? 1 : 0);
            }
        });

        it("handles `lte`", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method1NumberArgNumberReturn).withArgs(lte(5)).andReturn(1);
            expect(mockedTestInterface.method1NumberArgNumberReturn).andReturn(0);

            for (let i = -50; i < 50; i++) {
                assert.equal(mockedTestInterface.method1NumberArgNumberReturn(i), i <= 5 ? 1 : 0);
            }
        });

    });

    describe("2 arg overrides", () => {
        it("handles one string `matcher` one regular string", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringArgNumberReturn).withArgs(matcher((val: string) => val === "0"), "1").andReturn(0);
            expect(mockedTestInterface.method2StringArgNumberReturn).andReturn(-1);

            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "1"), 0);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "0"), -1);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("1", "1"), -1);
        });

        it("first eligible matcher wins", () => {
            const mockedTestInterface = mock(TestClass);

            expect(mockedTestInterface.method2StringArgNumberReturn).withArgs(any(), any()).andReturn(0);
            expect(mockedTestInterface.method2StringArgNumberReturn).withArgs("0", "2").andReturn(1);

            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "2"), 0);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "1"), 0);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("0", "0"), 0);
            assert.equal(mockedTestInterface.method2StringArgNumberReturn("1", "1"), 0);
        });
    })

});