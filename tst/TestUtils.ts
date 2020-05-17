function getLineNumber(): number {
    const stack = new Error().stack;
    if (!stack) {
        return 0;
    }
    const stackLines = stack.split("\n");
    const matches = /(\d+):(\d+)\)?$/.exec(stackLines[2]);
    if (!matches) {
        return 0;
    }
    return parseInt(matches[1]) ?? 0;
}
function escapeRegex(input: string): string {
    return input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export { escapeRegex, getLineNumber };