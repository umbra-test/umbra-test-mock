import { ArgumentValidator } from "@umbra-test/umbra-util";

interface CaptureInternalInterface<T> extends ArgumentValidator<T> {
    first: T | null;
    last: T | null;
    all: T[];
}

type Capture<T> = CaptureInternalInterface<T> & T;

class CaptureInternal<T> implements CaptureInternalInterface<T>, ArgumentValidator<T> {

    public readonly all: T[] = [];

    public get first(): T | null {
        if (this.all.length === 0) {
            return null;
        }

        return this.all[0];
    }

    public get last(): T | null {
        if (this.all.length === 0) {
            return null;
        }

        return this.all[this.all.length - 1];
    }

    public matches(arg: T): boolean {
        this.all.push(arg);
        return true;
    }

    public description(): string {
        if (this.all.length === 0) {
            return "Argument captor. No arguments captured";
        }
        return "Argument captor. Currently captured args: " + this.all;
    }

    public equals(other: ArgumentValidator<any>): boolean {
        if (other instanceof CaptureInternal) {
            return other.all === this.all;
        }

        return false;
    }
}

function newCapture<T>(): Capture<T> {
    return new CaptureInternal() as any;
}

export {
    Capture,
    newCapture
};