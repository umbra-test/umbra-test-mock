import { ArgumentValidator } from "@umbra-test/umbra-util";
import { ExpectationData } from "./InternalMocker";
import { MockableFunction } from "./Mock";
declare type ArgumentMatcher = ArgumentValidator<any>[] | null;
declare function findBestArgumentMatcher<F extends MockableFunction>(expectations: ExpectationData<F>[], args: any[]): ExpectationData<F> | null;
declare function verifyArgumentMatcher(expectedArgs: ArgumentMatcher, args: any[]): boolean;
declare function createMockedFunction<F extends MockableFunction>(): F;
export { createMockedFunction, findBestArgumentMatcher, ArgumentMatcher, verifyArgumentMatcher };
