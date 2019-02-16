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
        description: () => `gt(${value})`,
    };
    return validator as any;
}

function lt<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue < value),
        description: () => `lt(${value})`,
    };
    return validator as any;
}

function gte<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue >= value),
        description: () => `gte(${value})`,
    };
    return validator as any;
}

function lte<T extends number>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => realValue <= value),
        description: () => `lte(${value})`,
    };
    return validator as any;
}

function eq<T>(value: T): T {
    const validator: ArgumentValidator<T> = {
        matches: ((realValue: T) => value === realValue),
        description: () => value.toString(),
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