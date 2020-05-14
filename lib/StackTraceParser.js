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
        if (stackTraceLines.length < depth + 2) {
            return null;
        }
        const callingLocation = stackTraceLines[depth + 1];
        const matches = /.*?\((.*?)\)/.exec(callingLocation);
        if (matches === null) {
            return null;
        }
        return matches[1];
    }
}
exports.StacktraceUtils = StacktraceUtils;
//# sourceMappingURL=StackTraceParser.js.map