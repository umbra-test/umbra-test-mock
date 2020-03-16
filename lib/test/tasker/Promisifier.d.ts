import { Task } from "./Task";
import { TaskResult } from "./TaskResult";
declare class Promisifier {
    wrap<T>(fn: Task<T>): (results: T) => Promise<TaskResult>;
}
export { Promisifier };
