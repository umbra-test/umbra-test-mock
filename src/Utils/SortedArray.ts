type CompareFunction<T> = (a?: T, b?: T) => number;

class SortedArray<T> {

    private readonly array: T[];
    private readonly compareFunction: CompareFunction<T>;

    constructor(compare: CompareFunction<T> = compareDefault, initialValues: T[] = []) {
        this.array = [];
        this.compareFunction = compare || compareDefault;
        const length = initialValues.length;
        for (let i = 0; i < length; i++) {
            this.insert(initialValues[i]);
        }
    }

    public getData(): T[] {
        return this.array;
    }

    public insert(element: T) {
        let foundIndex = this.searchInternal(element) + 1;

        const highestIndex = this.array.length - 1;
        while ((foundIndex < highestIndex) && (this.compareFunction(element, this.array[foundIndex]) === 0)) {
            foundIndex++;
        }

        let index = this.array.length;
        this.array.push(element);
        while (index > foundIndex) {
            this.array[index] = this.array[--index];
        }
        this.array[foundIndex] = element;
    }

    public search(element: T) {
        const foundIndex = this.searchInternal(element);
        if (this.compareFunction(this.array[foundIndex], element) !== 0) {
            return -1;
        }

        return foundIndex;
    }

    public remove(element: T) {
        const index = this.search(element);
        if (index >= 0) {
            this.array.splice(index, 1);
        }
    }

    private searchInternal(element: T) {
        let high = this.array.length - 1;
        let low = 0;
        let index;
        let ordering;

        while (high >= low) {
            index = Math.floor((high + low) / 2);
            ordering = this.compareFunction(this.array[index], element);

            if (ordering < 0) {
                low = index + 1;
            } else if (ordering > 0) {
                high = index - 1;
            } else {
                return index;
            }
        }

        return high;
    }
}

function compareDefault<T>(a: T, b: T) {
    // Equality has a very low chance to happen. It should be the last option.
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
}

export {
    SortedArray as SortedArray
};