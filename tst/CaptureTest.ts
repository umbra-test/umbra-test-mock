import { mock, expect, verify, newCapture, Capture } from "..";
import { TestClass } from "./TestClass";
import { assert } from "umbra-assert";
import "mocha";

describe("Capture test cases", () => {

    describe("Function capture tests", () => {

        it("Should capture a function parameter", () => {
            type Callback = () => void;
            type CallbackTakingFunction = (callback: Callback) => void;
            const mockedFunction: CallbackTakingFunction = mock();
            const mockedCallback: Callback = mock();
            const capture: Capture<Callback> = newCapture();

            expect(mockedFunction).withArgs(capture.capture());
            expect(mockedCallback).once();

            mockedFunction(mockedCallback);
            const lastCapture = capture.last;
            if (lastCapture === null) {
                assert.fail("Last capture was null");
                return;
            }

            lastCapture();

            verify(mockedFunction, mockedCallback);
        });

    });

    describe("1 arg overrides", () => {
        
        it("Should capture the first value", () => {
            const mockedTestInterface = mock(TestClass);

            const argCapture: Capture<string> = newCapture();
            expect(mockedTestInterface.method1StringArgNumberReturn).withArgs(argCapture.capture()).andStubReturn(0);

            assert.equal(argCapture.last, null);
            assert.equal(argCapture.first, null);
            assert.equal(argCapture.all, []);

            mockedTestInterface.method1StringArgNumberReturn("0");

            assert.equal(argCapture.last, "0");
            assert.equal(argCapture.first, "0");
            assert.equal(argCapture.all, ["0"]);

            mockedTestInterface.method1StringArgNumberReturn("1");

            assert.equal(argCapture.last, "1");
            assert.equal(argCapture.first, "0");
            assert.equal(argCapture.all, ["0", "1"]);

            mockedTestInterface.method1StringArgNumberReturn("2");

            assert.equal(argCapture.last, "2");
            assert.equal(argCapture.first, "0");
            assert.equal(argCapture.all, ["0", "1", "2"]);

            verify(mockedTestInterface);
        });

    });

    describe("2 arg overrides", () => {
        
        it("Should capture the first value", () => {
            const mockedTestInterface = mock(TestClass);

            const arg1Capture: Capture<string> = newCapture();
            const arg2Capture: Capture<string> = newCapture();
            expect(mockedTestInterface.method2StringArgNumberReturn)
                .withArgs(arg1Capture.capture(), arg2Capture.capture())
                .andStubReturn(0);

            assert.equal(arg1Capture.last, null);
            assert.equal(arg1Capture.first, null);
            assert.equal(arg1Capture.all, []);
            assert.equal(arg2Capture.last, null);
            assert.equal(arg2Capture.first, null);
            assert.equal(arg2Capture.all, []);

            mockedTestInterface.method2StringArgNumberReturn("0", "0");

            assert.equal(arg1Capture.last, "0");
            assert.equal(arg1Capture.first, "0");
            assert.equal(arg1Capture.all, ["0"]);
            assert.equal(arg2Capture.last, "0");
            assert.equal(arg2Capture.first, "0");
            assert.equal(arg2Capture.all, ["0"]);

            mockedTestInterface.method2StringArgNumberReturn("1", "-1");

            assert.equal(arg1Capture.last, "1");
            assert.equal(arg1Capture.first, "0");
            assert.equal(arg1Capture.all, ["0", "1"]);
            assert.equal(arg2Capture.last, "-1");
            assert.equal(arg2Capture.first, "0");
            assert.equal(arg2Capture.all, ["0", "-1"]);

            mockedTestInterface.method2StringArgNumberReturn("2", "-2");

            assert.equal(arg1Capture.last, "2");
            assert.equal(arg1Capture.first, "0");
            assert.equal(arg1Capture.all, ["0", "1", "2"]);
            assert.equal(arg2Capture.last, "-2");
            assert.equal(arg2Capture.first, "0");
            assert.equal(arg2Capture.all, ["0", "-1", "-2"]);

            verify(mockedTestInterface);
        });

    });

});