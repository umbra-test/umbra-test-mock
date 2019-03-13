class StacktraceUtils {
    public static getCurrentMockLocation(depth: number): string | null {
        const stackTrace = new Error().stack;
        if (stackTrace === undefined) {
            return null;
        }

        const stackTraceLines = stackTrace.split("\n");
        if (stackTraceLines.length < depth + 2) {
            return null;
        }

        // This assumes we're 4 calls down. May need to update
        const callingLocation: string = stackTraceLines[depth + 1];
        const matches: RegExpExecArray | null = /.*?\((.*?)\)/.exec(callingLocation);
        if (matches === null) {
            return null;
        }

        return matches[1];
    }
}

export {
    StacktraceUtils
};