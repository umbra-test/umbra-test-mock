import { mock, verify, expect } from "../src/index";
import { assert } from "chai";
import "mocha";

interface TestInterface {

    exampleMethod(): string;
}

interface TestFunction {
    (): string;
}

type BasicFunction = () => string;

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

    describe("TestFunction", () => {
        it("should return mock value", () => {
            const mockedTestInterface = mock<TestFunction>();

            expect(mockedTestInterface).withArgs().andReturn(MOCK_RETURN_VAL);
            
            assert.equal(MOCK_RETURN_VAL, mockedTestInterface());

            verify(mockedTestInterface);
        });
    });
    
    describe("BasicFunction", () => {
        it("should return mock value", () => {
            const mockedTestInterface = mock<BasicFunction>();

            expect(mockedTestInterface).andReturn(MOCK_RETURN_VAL);
            
            assert.equal(MOCK_RETURN_VAL, mockedTestInterface());

            verify(mockedTestInterface);
        });
    });

});