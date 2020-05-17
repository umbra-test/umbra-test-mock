class StacktraceUtils {
    public static getCurrentMockLocation(depth: number): string | null {
        const stackTrace = new Error().stack;
        if (stackTrace === undefined) {
            return null;
        }

        const stackTraceLines = stackTrace.split("\n");
        const length = stackTraceLines.length;
        if (length < depth + 2) {
            return null;
        }

        // This assumes we start 3 calls down. May need to update
        let i = 2;
        let callingLocation: string | null = null;
        for (; i < length; i++) {
            callingLocation = stackTraceLines[i];
            // This is super hacky for right now and assumes there is only two entry points for this to be called from
            if (/(expect|InvocationHandler\.apply).*umbra/.test(callingLocation)) {
                i++;
                callingLocation = stackTraceLines[i];
                break;
            }
        }

        if (callingLocation === null) {
            return null;
        }

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