"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StacktraceUtils = void 0;
class StacktraceUtils {
    static getCurrentMockLocation(depth) {
        const stackTrace = new Error().stack;
        if (stackTrace === undefined) {
            return null;
        }
        const stackTraceLines = stackTrace.split("\n");
        const length = stackTraceLines.length;
        if (length < depth + 2) {
            return null;
        }
        let i = 2;
        let callingLocation = null;
        for (; i < length; i++) {
            callingLocation = stackTraceLines[i];
            if (/(expect|InvocationHandler\.apply).*umbra/.test(callingLocation)) {
                i++;
                callingLocation = stackTraceLines[i];
                break;
            }
        }
        if (callingLocation === null) {
            return null;
        }
        const matches = /.*?\((.*?)\)/.exec(callingLocation);
        if (matches === null) {
            return null;
        }
        return matches[1];
    }
}
exports.StacktraceUtils = StacktraceUtils;
//# sourceMappingURL=StackTraceParser.js.map