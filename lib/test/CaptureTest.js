"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const TestClass_1 = require("./TestClass");
const umbra_assert_1 = require("umbra-assert");
require("mocha");
describe("Capture test cases", () => {
    describe("Function capture tests", () => {
        it("Should capture a function parameter", () => {
            const mockedFunction = __1.mock();
            const mockedCallback = __1.mock();
            const capture = __1.newCapture();
            __1.expect(mockedFunction).withArgs(capture.capture());
            __1.expect(mockedCallback).once();
            mockedFunction(mockedCallback);
            const lastCapture = capture.last;
            if (lastCapture === null) {
                umbra_assert_1.assert.fail("Last capture was null");
                return;
            }
            lastCapture();
            __1.verify(mockedFunction, mockedCallback);
        });
    });
    describe("1 arg overrides", () => {
        it("Should capture the first value", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            const argCapture = __1.newCapture();
            __1.expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(argCapture.capture()).andStubReturn(0);
            umbra_assert_1.assert.equal(argCapture.last, null);
            umbra_assert_1.assert.equal(argCapture.first, null);
            umbra_assert_1.assert.equal(argCapture.all, []);
            mockedTestInterface.method1StringArgNumberReturn("0");
            umbra_assert_1.assert.equal(argCapture.last, "0");
            umbra_assert_1.assert.equal(argCapture.first, "0");
            umbra_assert_1.assert.equal(argCapture.all, ["0"]);
            mockedTestInterface.method1StringArgNumberReturn("1");
            umbra_assert_1.assert.equal(argCapture.last, "1");
            umbra_assert_1.assert.equal(argCapture.first, "0");
            umbra_assert_1.assert.equal(argCapture.all, ["0", "1"]);
            mockedTestInterface.method1StringArgNumberReturn("2");
            umbra_assert_1.assert.equal(argCapture.last, "2");
            umbra_assert_1.assert.equal(argCapture.first, "0");
            umbra_assert_1.assert.equal(argCapture.all, ["0", "1", "2"]);
            __1.verify(mockedTestInterface);
        });
    });
    describe("2 arg overrides", () => {
        it("Should capture the first value", () => {
            const mockedTestInterface = __1.mock(TestClass_1.TestClass);
            const arg1Capture = __1.newCapture();
            const arg2Capture = __1.newCapture();
            __1.expect(mockedTestInterface.method2StringArgNumberReturn)
                .withArgs(arg1Capture.capture(), arg2Capture.capture())
                .andStubReturn(0);
            umbra_assert_1.assert.equal(arg1Capture.last, null);
            umbra_assert_1.assert.equal(arg1Capture.first, null);
            umbra_assert_1.assert.equal(arg1Capture.all, []);
            umbra_assert_1.assert.equal(arg2Capture.last, null);
            umbra_assert_1.assert.equal(arg2Capture.first, null);
            umbra_assert_1.assert.equal(arg2Capture.all, []);
            mockedTestInterface.method2StringArgNumberReturn("0", "0");
            umbra_assert_1.assert.equal(arg1Capture.last, "0");
            umbra_assert_1.assert.equal(arg1Capture.first, "0");
            umbra_assert_1.assert.equal(arg1Capture.all, ["0"]);
            umbra_assert_1.assert.equal(arg2Capture.last, "0");
            umbra_assert_1.assert.equal(arg2Capture.first, "0");
            umbra_assert_1.assert.equal(arg2Capture.all, ["0"]);
            mockedTestInterface.method2StringArgNumberReturn("1", "-1");
            umbra_assert_1.assert.equal(arg1Capture.last, "1");
            umbra_assert_1.assert.equal(arg1Capture.first, "0");
            umbra_assert_1.assert.equal(arg1Capture.all, ["0", "1"]);
            umbra_assert_1.assert.equal(arg2Capture.last, "-1");
            umbra_assert_1.assert.equal(arg2Capture.first, "0");
            umbra_assert_1.assert.equal(arg2Capture.all, ["0", "-1"]);
            mockedTestInterface.method2StringArgNumberReturn("2", "-2");
            umbra_assert_1.assert.equal(arg1Capture.last, "2");
            umbra_assert_1.assert.equal(arg1Capture.first, "0");
            umbra_assert_1.assert.equal(arg1Capture.all, ["0", "1", "2"]);
            umbra_assert_1.assert.equal(arg2Capture.last, "-2");
            umbra_assert_1.assert.equal(arg2Capture.first, "0");
            umbra_assert_1.assert.equal(arg2Capture.all, ["0", "-1", "-2"]);
            __1.verify(mockedTestInterface);
        });
    });
});
//# sourceMappingURL=CaptureTest.js.map