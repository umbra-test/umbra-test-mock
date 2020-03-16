declare const REAL_NUMBER_RETURN_VALUE = 200;
declare class TestClass {
    method1StringArgNumberReturn(arg1: string): number;
    method1NumberArgNumberReturn(arg1: number): number;
    method1AnyArgNumberReturn(arg1: any): number;
    method1ObjectArgNumberReturn(arg1: {}): number;
    method2StringArgNumberReturn(arg1: string, arg2: string): number;
    method2StringOptionalArgNumberReturn(arg1: string, arg2?: string): number;
    methodNoArgPromiseReturn(): Promise<number>;
}
export { TestClass, REAL_NUMBER_RETURN_VALUE };
