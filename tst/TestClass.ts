const REAL_NUMBER_RETURN_VALUE = 200;
const REAL_STRING_RETURN_VALUE = "200";

class TestClass {

    public testStringField: string | null = null;
    public testNumberField: number | null = null;
    public testBooleanField: boolean | null = null;
    public testRegexField: RegExp | null = null;
    public testDateField: Date | null = null;
    private getterSetterProperty: string = "";

    public static staticMethod1StringArgNumberReturn(arg1: string): number {
        console.log("Enter static method with one string arg");
        return REAL_NUMBER_RETURN_VALUE;
    }

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

    method1AnyArgStringReturn(arg1: any): string {
        console.log("Enter method with one any arg");
        return REAL_STRING_RETURN_VALUE;
    }

    method1ObjectArgNumberReturn(arg1: {}): number {
        console.log("Enter method with one object arg");
        return REAL_NUMBER_RETURN_VALUE;
    }

    method2StringArgNumberReturn(arg1: string, arg2: string): number {
        console.log("Enter method with two string args");
        return REAL_NUMBER_RETURN_VALUE;
    }

    method2StringOptionalArgNumberReturn(arg1: string, arg2?: string): number {
        console.log("Enter method with two string args (optional second)");
        return REAL_NUMBER_RETURN_VALUE;
    }

    methodNoArgPromiseReturn(): Promise<number> {
        return Promise.resolve(REAL_NUMBER_RETURN_VALUE);
    }

    method1AnyArgVoidReturn(arg1: any): void {
        console.log("Enter method with one any arg, void return");
    }

    method1AnyArgNeverReturn(arg1: any): never {
        throw new Error();
    }

    public set setterValue(value : string) {
        console.log("Setter value");
        this.getterSetterProperty = value;
    }

    public get getterValue(): string {
        console.log("Getter value");
        return this.getterSetterProperty;
    }
    
}

class SecondLevelTestClass extends TestClass {


    secondLevelMethodMethod1AnyArgStringReturn(arg1: any): string {
        console.log("Enter second level method with one any arg");
        return REAL_STRING_RETURN_VALUE;
    }
}


class ThirdLevelTestClass extends TestClass {


    thirdLevelMethodMethod1AnyArgStringReturn(arg1: any): string {
        console.log("Enter third level method with one any arg");
        return REAL_STRING_RETURN_VALUE;
    }
}

export {
    TestClass,
    SecondLevelTestClass,
    ThirdLevelTestClass,
    REAL_NUMBER_RETURN_VALUE
}