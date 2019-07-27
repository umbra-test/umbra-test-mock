import { expect, inOrder, mock, verify  } from "../src";

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

});