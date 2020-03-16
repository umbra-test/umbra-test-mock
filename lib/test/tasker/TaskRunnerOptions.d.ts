interface Options {
    onTaskStart?: (taskName: string, taskDependencies: string[]) => void;
    onTaskEnd?: (taskName: string) => void;
    throwOnOverwrite?: boolean;
}
export { Options };
