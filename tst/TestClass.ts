const REAL_NUMBER_RETURN_VALUE = 200;

class TestClass {

    method1StringArgNumberReturn(arg1: string): number {
        console.log("Enter method with one string arg");
        return REAL_NUMBER_RETURN_VALUE;
    }

    method1NumberArgNumberReturn(arg1: number): number {
        console.log("Enter method with one number arg");
        return REAL_NUMBER_RETURN_VALUE;
    }

    method1AnyArgNumberReturn(arg1: any): number {
        console.log("Enter method with one any arg");
        return REAL_NUMBER_RETURN_VALUE;
    }

    method2StringArgNumberReturn(arg1: string, arg2: string): number {
        console.log("Enter method with two string args");
        return REAL_NUMBER_RETURN_VALUE;
    }

    methodNoArgPromiseReturn(): Promise<number> {
        return Promise.resolve(REAL_NUMBER_RETURN_VALUE);
    }

}

export {
    TestClass,
    REAL_NUMBER_RETURN_VALUE
}