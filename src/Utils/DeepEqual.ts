function deepEqual(a: any, b: any): boolean {
    if (a === b) {
        return true;
    } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    } else if (!exists(a) || !exists(b) || typeof a !== "object" && typeof b !== "object") {
        return a === b;
    } else {
        return deepEqualObject(a, b);
    }
}

function deepEqualObject(a: any, b: any): boolean {
    let i;
    let key;
    if (!exists(a) || !exists(b)) {
        return false;
    }

    if (a.prototype !== b.prototype) {
        return false;
    }

    let aKeys;
    let bKeys;
    try {
        aKeys = Object.keys(a);
        bKeys = Object.keys(b);
    } catch (e) {
        return false;
    }

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    aKeys.sort();
    bKeys.sort();
    for (i = aKeys.length - 1; i >= 0; i--) {
        if (aKeys[i] !== bKeys[i]) {
            return false;
        }
    }

    for (i = aKeys.length - 1; i >= 0; i--) {
        key = aKeys[i];
        if (!deepEqual(a[key], b[key])) {
            return false;
        }
    }
    return typeof a === typeof b;
}

function exists(value: any | null | undefined): boolean {
    return value !== null && value !== undefined;
}

export {
    deepEqual
};