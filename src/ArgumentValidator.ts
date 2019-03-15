import { deepEqual } from "./Utils/DeepEqual";

function any<T>(): T {
    const validator: ArgumentValidator<T> = {
        matches: () => true,
        description: () => "any()",
    };
    return validator as any;
}

function gt<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue > value),
        description: () => `gt(${JSON.stringify(value)})`,
    };
    return validator as any;
}

function lt<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue < value),
        description: () => `lt(${JSON.stringify(value)})`,
    };
    return validator as any;
}

function gte<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue >= value),
        description: () => `gte(${JSON.stringify(value)})`,
    };
    return validator as any;
}

function lte<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue <= value),
        description: () => `lte(${JSON.stringify(value)})`,
    };
    return validator as any;
}

function eq<T>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => deepEqual(value, realValue)),
        description: () => JSON.stringify(value),
    };
    return validator as any;
}

function matcher<T>(func: (arg: T) => boolean): T {
    return {
        matches: (realValue: T) => func(realValue),
        description: () => func.toString(),
    } as any;
}

interface ArgumentValidator<T> {

    matches(arg: T): boolean;

    description?(): string;
}

export {
    any,
    eq,
    gt,
    gte,
    lt,
    lte,
    matcher,
    ArgumentValidator,
};