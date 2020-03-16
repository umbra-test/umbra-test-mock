declare class Range {
    readonly start: number;
    readonly end: number;
    constructor(start: number, end?: number);
    isFixedRange(): boolean;
    isInRange(count: number): boolean;
    hasNoUpperBound(): boolean;
    describeRange(): string;
}
export { Range };
