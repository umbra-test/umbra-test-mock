"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdMocks = void 0;
const Verify_1 = require("./Verify");
let createdMocks = null;
exports.createdMocks = createdMocks;
const umbraTestRunner = global["__testRunner"];
if (umbraTestRunner) {
    exports.createdMocks = createdMocks = [];
    umbraTestRunner.on("testSuccess", () => {
        for (const mock of createdMocks) {
            Verify_1.verify(mock);
        }
        exports.createdMocks = createdMocks = [];
    });
    umbraTestRunner.on("testFail", () => {
        exports.createdMocks = createdMocks = [];
    });
    umbraTestRunner.on("testTimeout", () => {
        exports.createdMocks = createdMocks = [];
    });
}
//# sourceMappingURL=UmbraTestRunnerIntegration.js.map