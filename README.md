# Umbra Mock
Umbra mock is a mocking framework built to take full advantage of ES6 proxies and Typescript. It's focus is on making writing tests easier and less error prone. Let's take a look at some simple examples.

## Features
* Strongly typed mocks - better compile time errors
* ES6 Proxy usage - less boilerplate code for mocking objects and classes
* Strict mocks - more likely to catch incorrectly written tests
* No dependencies - small and fast

## Getting Started
```
npm install --save-dev umbra-mock
```

Note: Your runtime environment must be ES5 compatible, and must have an ES6 Proxy implementation available globally. For Node this means you must be using Node 6 or greater

To declare a mock:
```typescript
interface SomeObject {
    run(): void;
}
const someObject: SomeObject = mock<SomeObject>();
```

To set expectations:
```typescript
expect(someObject.run).once();
```

## Umbra In Depth
### Basic example
Imagine we have this code for itereating over a list of items
```typescript
type Callback<T> = (item: T) => void;
function forEach<T>(items: T[], callback: Callback<T>) {
    for (let index = 0; index < items.length; index++) {
        callback(items[index]);
    }
}
```
The most basic test case for this would look like this:
```typescript
import { describe, expect, inOrder, it, mock } from "umbra";

describe("forEach", () => {
    it("calls each method", () => {
        // Creates a mock of type Callback<Number>. Could also be written as:
        // const callback = mock<Callback<number>>();
        const callback: Callback<number> = mock();

        // Expect that the mock will be invoked like:
        // callback(0);
        // callback(1);
        // callback(2);
        inOrder(
            expect(callback).withArgs(0).once(),
            expect(callback).withArgs(1).once(),
            expect(callback).withArgs(2).once()
        );

        // Run the test with the mock
        const list = [0, 1, 2];
        forEach(list, callback);
    });
});
```

With Umbra, mocking expectations must be set before the test is run. If a function is invoked without an expectation an error is thrown. For example if we were to add the value 3 to the end of the list we would get the following exception:

```
Error: mock(3) was called but no expectation matched. Expectations:
mock(0) at tst/Samples.ts:19:46
mock(1) at tst/Samples.ts:20:46
mock(2) at tst/Samples.ts:21:46
```

This is intentionally different from most mocking frameworks which are "loose" by default. By being strict and declaring your expectations ahead of time you will catch more bugs and other unintended behavior.

Also note in this example we use the `inOrder` function to ensure the list is invoked in the same order as the list. This is because by default Umbra mocks do not assume ordering and may execute in any order. This is often helpful in testing code after it has been refactored. For example lets say we have this code:

```typescript

```
### Matchers
Often you might not want to specify the exact argument for the mock. In cases of ambiguity like this you can use matchers to match multiple cases. For example:

```typescript
type Callback<T> = (item1: T, item2: T) => void;
const callback: Callback<number> = mock();
expect(callback).withArgs(0, any()).once();
// First param to callback must be 0, the second arg can be any value
```

Matchers are given lower precedence than more specific arguments, regardless of ordering. For example:
```typescript
type Callback<T> = (item1: T, item2: T) => number;
const callback: Callback<number> = mock();
expect(callback).withArgs(0, any()).andReturn(1).once();
expect(callback).withArgs(0, 1).andReturn(0).once();
// callback(0, 1) will return 0
// callback(0, 0) will return 1

```

### Capturing arguments
Many times you may need access to once of the values pass to your mock function. A common example is a callback, or an event listener of some kind. To gain access to this value you use a `Capture`. For example:

```typescript
type Callback = () => void;
type CallbackTakingFunction = (callback: Callback) => void;

const mockedFunction: CallbackTakingFunction = mock();
const callbackCapture: Capture<Callback> = newCapture();
expect(mockedFunction).withArgs(callbackCapture.capture());
expect(mockedCallback).once();

const realCallback = () => console.log("Do something")
mockedFunction(realCallback);
const lastCapture: Callback = callbackCapture.last;
// Last capture is now the same as realCallback
```




## Why not to use Umbra?
* Not backwards compatible with any other mocking framework


