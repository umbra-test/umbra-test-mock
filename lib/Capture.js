"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newCapture = void 0;
class CaptureInternal {
    constructor() {
        this.all = [];
    }
    get first() {
        if (this.all.length === 0) {
            return null;
        }
        return this.all[0];
    }
    get last() {
        if (this.all.length === 0) {
            return null;
        }
        return this.all[this.all.length - 1];
    }
    matches(arg) {
        this.all.push(arg);
        return true;
    }
    description() {
        if (this.all.length === 0) {
            return "Argument captor. No arguments captured";
        }
        return "Argument captor. Currently captured args: " + this.all;
    }
    equals(other) {
        if (other instanceof CaptureInternal) {
            return other.all === this.all;
        }
        return false;
    }
}
function newCapture() {
    return new CaptureInternal();
}
exports.newCapture = newCapture;
//# sourceMappingURL=Capture.js.map