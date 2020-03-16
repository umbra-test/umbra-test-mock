interface Capture<T> {
    first: T | null;
    last: T | null;
    all: T[];
    capture(): T;
}
declare function newCapture<T>(): Capture<T>;
export { Capture, newCapture };
