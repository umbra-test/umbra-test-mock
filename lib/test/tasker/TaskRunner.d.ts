import { Promisifier } from "./Promisifier";
import { Task } from "./Task";
import { Options } from "./TaskRunnerOptions";
declare class TaskRunner {
    private promisifier;
    private options;
    private taskMap;
    private execInProgress;
    constructor(options?: Options, promisifier?: Promisifier);
    addTask<T>(taskName: string, dependencies?: string | string[] | Task<T>, task?: Task<T>): void;
    removeTask(taskName: string): void;
    addDependencies(taskName: string, dependencies: string | string[]): void;
    removeDependencies(taskName: string, dependencies: string | string[]): void;
    getTaskList(): {
        [taskName: string]: string[];
    };
    run<T>(taskName: string): Promise<T>;
    private runTask;
    private throwIfInProgress;
}
export { TaskRunner };
