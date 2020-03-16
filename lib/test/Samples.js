"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const umbra_assert_1 = require("umbra-assert");
require("mocha");
function forEach(items, callback) {
    for (let index = 0; index < items.length; index++) {
        callback(items[index]);
    }
}
describe("Samples", () => {
    describe("forEach", () => {
        it("calls each method in order", () => {
            const callback = __1.mock();
            __1.inOrder(__1.expect(callback).withArgs(0).once(), __1.expect(callback).withArgs(1).once(), __1.expect(callback).withArgs(2).once());
            const list = [0, 1, 2];
            forEach(list, callback);
            __1.verify();
        });
        it("calls each method in order with alternate typing", () => {
            const callback = __1.mock();
            __1.inOrder(__1.expect(callback).withArgs(0).once(), __1.expect(callback).withArgs(1).once(), __1.expect(callback).withArgs(2).once());
            const list = [0, 1, 2];
            forEach(list, callback);
            __1.verify();
        });
    });
    describe("matchers", () => {
        it("matches with any", () => {
            const callback = __1.mock();
            __1.expect(callback).withArgs(0, __1.any()).andReturn(1).once();
            __1.expect(callback).withArgs(0, 1).andReturn(0).once();
            umbra_assert_1.assert.equal(callback(0, 1), 0);
            umbra_assert_1.assert.equal(callback(0, 0), 1);
        });
        it("falls back ordering", () => {
            const callback = __1.mock();
            __1.expect(callback).withArgs(0, __1.any()).andReturn(1).once();
            __1.expect(callback).withArgs(__1.any(), 1).andReturn(0).once();
            umbra_assert_1.assert.equal(callback(0, 1), 1);
            umbra_assert_1.assert.equal(callback(0, 1), 0);
        });
    });
});
//# sourceMappingURL=Samples.js.map