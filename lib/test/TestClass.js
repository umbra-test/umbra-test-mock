"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const REAL_NUMBER_RETURN_VALUE = 200;
exports.REAL_NUMBER_RETURN_VALUE = REAL_NUMBER_RETURN_VALUE;
class TestClass {
    method1StringArgNumberReturn(arg1) {
        console.log("Enter method with one string arg");
        return REAL_NUMBER_RETURN_VALUE;
    }
    method1NumberArgNumberReturn(arg1) {
        console.log("Enter method with one number arg");
        return REAL_NUMBER_RETURN_VALUE;
    }
    method1AnyArgNumberReturn(arg1) {
        console.log("Enter method with one any arg");
        return REAL_NUMBER_RETURN_VALUE;
    }
    method1ObjectArgNumberReturn(arg1) {
        console.log("Enter method with one object arg");
        return REAL_NUMBER_RETURN_VALUE;
    }
    method2StringArgNumberReturn(arg1, arg2) {
        console.log("Enter method with two string args");
        return REAL_NUMBER_RETURN_VALUE;
    }
    method2StringOptionalArgNumberReturn(arg1, arg2) {
        console.log("Enter method with two string args (optional second)");
        return REAL_NUMBER_RETURN_VALUE;
    }
    methodNoArgPromiseReturn() {
        return Promise.resolve(REAL_NUMBER_RETURN_VALUE);
    }
}
exports.TestClass = TestClass;
//# sourceMappingURL=TestClass.js.map