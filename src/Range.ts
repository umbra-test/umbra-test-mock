class Range {
    public readonly start: number;
    public readonly end: number;

    public constructor(start: number, end: number = start) {
        if (start < 0) {
            throw new Error(`Start value must be >= 0. Received ${start}`);
        }

        if (end < 1) {
            throw Error(`End value must be >= 1. Received ${end}`);
        }

        if (start > end) {
            throw new Error(`Start must be <= end. Start: ${start} End: ${end}`);
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
        return this.end === Number.MAX_SAFE_INTEGER;
    }

    public describeRange() {
        if (this.isFixedRange()) {
            return `${this.start} invocations`;
        }
        if (this.hasNoUpperBound()) {
            return `at least ${this.start} invocations`;
        }

        return `between ${this.start} and ${this.end} invocations`;
    }
}

export {
    Range
};