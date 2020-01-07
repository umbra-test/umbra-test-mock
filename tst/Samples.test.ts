import { expect, inOrder, mock, verify, any  } from "..";
import { assert } from "umbra-assert";
import "mocha";

type Callback<T> = (item: T) => void;
function forEach<T>(items: T[], callback: Callback<T>) {
    for (let index = 0; index < items.length; index++) {
        callback(items[index]);
    }
}


describe("Samples", () => {

    describe("forEach", () => {
        it("calls each method in order", () => {
            const callback: Callback<number> = mock();

            inOrder(
                expect(callback).withArgs(0).once(),
                expect(callback).withArgs(1).once(),
                expect(callback).withArgs(2).once()
            );
    

            const list = [0, 1, 2];
            forEach(list, callback);

            verify();
        });

        it("calls each method in order with alternate typing", () => {
            const callback = mock<Callback<number>>();

            inOrder(
                expect(callback).withArgs(0).once(),
                expect(callback).withArgs(1).once(),
                expect(callback).withArgs(2).once()
            );
    

            const list = [0, 1, 2];
            forEach(list, callback);

            verify();
        });
    });

    describe("matchers", () => {

        it("matches with any", () => {
            type Callback<T> = (item1: T, item2: T) => number;
            const callback: Callback<number> = mock();
            expect(callback).withArgs(0, any()).andReturn(1).once();
            expect(callback).withArgs(0, 1).andReturn(0).once();

            assert.equal(callback(0, 1), 0);
            assert.equal(callback(0, 0), 1);
        });

        it("falls back ordering", () => {
            type Callback<T> = (item1: T, item2: T) => number;
            const callback: Callback<number> = mock();
            expect(callback).withArgs(0, any()).andReturn(1).once();
            expect(callback).withArgs(any(), 1).andReturn(0).once();

            assert.equal(callback(0, 1), 1);
            assert.equal(callback(0, 1), 0);
        });
        
    });

});