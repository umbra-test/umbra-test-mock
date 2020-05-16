import { verify } from "./Verify";

let createdMocks: any | null = null;
const umbraTestRunner = (global as any).__testRunner;
if (umbraTestRunner) {
    createdMocks = [];
    umbraTestRunner.on("testSuccess", () => {
        for (const mock of createdMocks) {
            verify(mock);
        }
        createdMocks = [];
    });
    umbraTestRunner.on("testFail", () => {
        createdMocks = [];
    });
    umbraTestRunner.on("testTimeout", () => {
        createdMocks = [];
    });
}

export {
    createdMocks
};