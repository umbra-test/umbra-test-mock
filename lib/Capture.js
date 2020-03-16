"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    capture() {
        return this;
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
}
function newCapture() {
    return new CaptureInternal();
}
exports.newCapture = newCapture;
//# sourceMappingURL=Capture.js.map