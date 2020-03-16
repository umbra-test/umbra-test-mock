"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Range {
    constructor(start, end = start) {
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
    isFixedRange() {
        return this.start === this.end;
    }
    isInRange(count) {
        return count >= this.start && count <= this.end;
    }
    hasNoUpperBound() {
        return this.end === Number.MAX_SAFE_INTEGER;
    }
    describeRange() {
        if (this.isFixedRange()) {
            return `${this.start} invocations`;
        }
        if (this.hasNoUpperBound()) {
            return `at least ${this.start} invocations`;
        }
        return `between ${this.start} and ${this.end} invocations`;
    }
}
exports.Range = Range;
//# sourceMappingURL=Range.js.map