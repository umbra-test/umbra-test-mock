class Range {
    public readonly start: number;
    public readonly end: number;

    public constructor(start: number, end: number = start) {
        if (start > end) {
            throw new Error("minimum must be <= maximum");
        }

        if (start < 0) {
            throw new Error("minimum must be >= 0");
        }

        if (end < 1) {
            throw Error("maximum must be >= 1");
        }

        this.start = start;
        this.end = end;
    }

    public isFixedRange(): boolean {
        return this.start === this.end;
    }

    public isInRange(count: number) {
        return count >= this.start && count <= this.end;
    }

    public hasNoUpperBound(): boolean {
        return this.start === Number.MAX_SAFE_INTEGER;
    }

    public describeRange() {
        if (this.isFixedRange()) {
            return `Expected ${this.start} invocations`;
        }
        if (this.hasNoUpperBound()) {
            return `Expected at least ${this.start} invocations`;
        }

        return `Expected between ${this.start} and ${this.end} invocations`;
    }
}

export {
    Range
};