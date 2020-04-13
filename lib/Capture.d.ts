import { ArgumentValidator } from "@umbra-test/umbra-util";
interface CaptureInternalInterface<T> extends ArgumentValidator<T> {
    first: T | null;
    last: T | null;
    all: T[];
}
declare type Capture<T> = CaptureInternalInterface<T> & T;
declare function newCapture<T>(): Capture<T>;
export { Capture, newCapture };
