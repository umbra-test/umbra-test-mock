import { TaskRunner } from "./TaskRunner";
import { Task, AsyncTask } from "./Task";
import { mock, verify, expect, spy, inOrder } from "../../src/index";
import { assert } from "chai";

type OnTaskStart = (taskName: string, taskDependencies: string[]) => void;
type OnTaskEnd = (taskName: string) => void;

describe("TaskRunner", () => {
    let taskRunner: TaskRunner;
    beforeEach(() => {
        taskRunner = new TaskRunner();
    });

    const addTask = function (name: string, dependencies: string[] = []): Task<any> {
        const task: Task<any> = mock(name);
        taskRunner.addTask(name, dependencies, task);

        return task;
    };

    describe("missing tasks", () => {
        it("errors if the expected task doesn't exist", () => {
            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch((error) => {
                    assert.exists(error);
                });
        });

        it("errors if the expected dependencies don't exist", () => {
            const rootTask = addTask("root", ["missingTask"]);

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(rootTask);
                });
        });
    });

    describe("cycle handling", () => {
        it("errors when cycles are detected", () => {
            const child1 = addTask("child1", ["root"]);
            const root = addTask("root", ["child1"]);

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(root, child1);
                });
        });

        it("errors when there's a long cycle", () => {
            const child4 = addTask("child4", ["root"]);
            const child3 = addTask("child3", ["child4"]);
            const child2 = addTask("child2", ["child3"]);
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1"]);

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(root, child1, child2, child3, child4);
                });
        });

        it("errors a task depends on itself", () => {
            const root = addTask("root", ["root"]);

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(root);
                });
        });
    });

    describe("standard tasks", () => {
        it("executes a single task without dependencies", () => {
            const root = addTask("root");
            expect(root).once();
            return taskRunner.run("root").then(() => {
                verify(root);
            });
        });

        it("executes a single task without dependencies nor an actual callback", () => {
            taskRunner.addTask("root");
            return taskRunner.run("root");
        });

        it("executes a single task added with the two-param shorthand.", () => {
            const root = mock<Task<any>>();
            taskRunner.addTask("root", root);

            expect(root).once();
            return taskRunner.run("root").then(() => verify(root));
        });

        it("will run tasks again if run twice", () => {
            const root = addTask("root");
            expect(root).twice();
            return taskRunner.run("root").then(() => taskRunner.run("root")).then(() => verify(root));
        });

        it("executes each duplicate child only once", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1", "child2"]);

            expect(child2).once();
            expect(child1).once();
            expect(root).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("executes dependent tasks once per run call, not caching between top-level executions", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1", "child2"]);

            expect(child2).twice();
            expect(child1).twice();
            expect(root).twice();

            return taskRunner.run("root").then(() => taskRunner.run("root")).then(() => {
                verify(root, child1, child2);
            });
        });

        it("executes a tree of nodes, in order", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1", "child2"]);

            inOrder(
                expect(child2).once(),
                expect(child1).once(),
                expect(root).once(),
            );

            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("runs leaf nodes asynchronously and in parallel if able", () => {
            const childDones: any[] = [];

            const onChildStarted = (done: any) => {
                childDones.push(done);
                if (childDones.length === 2) {
                    for (const done of childDones) {
                        done();
                    }
                }
            };

            const child2: AsyncTask<any> = (results, done) => {
                onChildStarted(done);
            };

            const child1: AsyncTask<any> = (results, done) => {
                onChildStarted(done);
            };

            const root: Task<any> = mock();
            expect(root).once();

            taskRunner.addTask("child2", child2);
            taskRunner.addTask("child1", child1);
            taskRunner.addTask("root", ["child1", "child2"], root);

            return taskRunner.run("root").then(() => {
                verify(root);
            });
        });

        it("should throw an error when adding a task when one already exists.", () => {
            const root = addTask("root");

            try {
                addTask("root");
                assert.fail("Did not throw");
            } catch (e) {
                // no-op
            }

            verify(root);
        });

        it("adding a task with the same name overwrites the first one, if throwOnOverwrite is false", () => {
            taskRunner = new TaskRunner({ throwOnOverwrite: false });
            const originalTask = addTask("root");
            const newTask = addTask("root");

            expect(newTask).once();

            return taskRunner.run("root").then(() => {
                verify(originalTask, newTask);
            });
        });

        it("tasks can be added with dependencies that don't yet exist", () => {
            const root = addTask("root", ["child1"]);
            const child1 = addTask("child1");

            expect(child1).once();
            expect(root).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });

        it("can add dependencies by string, rather than string array", () => {
            const child1 = addTask("child1");
            const root: Task<any> = mock();
            taskRunner.addTask("root", "child1", root);

            expect(root).once();
            expect(child1).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });
    });

    describe("addDependency", () => {
        it("can have dependencies added to already existing tasks", () => {
            const root = addTask("root");
            const child1 = addTask("child1");

            taskRunner.addDependencies("root", ["child1"]);

            expect(root).once();
            expect(child1).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });

        it("can have only a single dependency added as a string, rather than an array.", () => {
            const root = addTask("root");
            const child1 = addTask("child1");

            taskRunner.addDependencies("root", "child1");

            expect(root).once();
            expect(child1).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });

        it("throws an error when adding a dependency to a non-existent task.", () => {
            const root: Task<any> = mock();
            try {
                taskRunner.addTask("root", [], root);
                taskRunner.addDependencies("missingTask", ["root"]);
                assert.fail("Expected to throw")
            } catch (e) {
                verify(root);
            }
        });

        it("deduplicates when adding a dependency that already exists.", () => {
            const child1 = addTask("child1");
            const root = addTask("root", ["child1"]);

            taskRunner.addDependencies("root", ["child1"]);

            expect(root).once();
            expect(child1).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });

        it("deduplicates when adding the same dependency multiple times.", () => {
            const child1 = addTask("child1");
            const root = addTask("root");

            taskRunner.addDependencies("root", ["child1"]);
            taskRunner.addDependencies("root", ["child1"]);

            expect(root).once();
            expect(child1).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });
    });

    describe("removeDependency", () => {
        it("will do nothing when removing a dependency that does not exist.", () => {
            taskRunner.addTask("root", [], mock());
            taskRunner.removeDependencies("root", ["missingDependency"]);
        });

        it("will do nothing when removing a dependency for a task that doesn't exist.", () => {
            taskRunner.addTask("root", [], mock());
            taskRunner.removeDependencies("missingTask", ["root"]);
        });

        it("won't call a removed dependency.", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1");
            const root = addTask("root", ["child1", "child2"]);

            taskRunner.removeDependencies("root", ["child1"]);

            expect(root).once();
            expect(child2).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("won't call a dependency removed as a string, rather than an array", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1");
            const root = addTask("root", ["child1", "child2"]);

            taskRunner.removeDependencies("root", "child1");

            expect(root).once();
            expect(child2).once();

            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("can be remove multiple dependencies.", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1", "child2"]);

            taskRunner.removeDependencies("root", ["child1", "child2"]);

            expect(root).once();
            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("can remove non-root dependencies.", () => {
            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1"]);

            taskRunner.removeDependencies("child1", ["child2"]);

            expect(root).once();
            expect(child1).once();
            return taskRunner.run("root").then(() => {
                verify(root, child1, child2);
            });
        });

        it("ignores duplicates in the removal list.", () => {
            const child1 = addTask("child1");
            const root = addTask("root", ["child1"]);

            taskRunner.removeDependencies("root", ["child1", "child1"]);

            expect(root).once();
            return taskRunner.run("root").then(() => {
                verify(root, child1);
            });
        });
    });

    describe("removeTask", () => {
        it("should do nothing if the task does not exist.", () => {
            taskRunner.removeTask("root");
        });

        it("should remove a task if it exists.", () => {
            const root = addTask("root");
            taskRunner.removeTask("root");

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(root);
                });
        });

        it("should not affect tasks that depend on the removed task.", () => {
            const child1 = addTask("child1");
            const root = addTask("root", ["child1"]);

            taskRunner.removeTask("child1");

            return taskRunner.run("root")
                .then(() => assert.fail("Should not succeed"))
                .catch(() => {
                    verify(root, child1);
                });
        });
    });

    describe("result passing", () => {
        it("should pass the end result of the run to caller.", () => {
            const rootResults = 6;
            taskRunner.addTask("root", [], () => rootResults);

            return taskRunner.run("root").then((results) => {
                assert.equal(results, rootResults);
            });
        });

        it("should pass the results of dependencies to tasks.", () => {
            const child1Result = 6;
            taskRunner.addTask("child1", [], () => child1Result);

            taskRunner.addTask("root", ["child1"], (results: any) => {
                assert.equal(results["child1"], child1Result);
            });

            return taskRunner.run("root");
        });

        it("should pass null results of dependencies to tasks.", () => {
            const child1Result = null;
            taskRunner.addTask("child1", [], () => child1Result);

            taskRunner.addTask("root", ["child1"], (results: any) => {
                assert.equal(results["child1"], child1Result);
            });

            return taskRunner.run("root");
        });
    });

    describe("execution locking", () => {
        const expectThrow = function (expectedThrowFunction: any): any {
            let onComplete: any = null;
            const task: AsyncTask<any> = (results, done) => {
                onComplete = done;
            };
            taskRunner.addTask("root", task);

            const runningPromise = taskRunner.run("root");

            try {
                expectedThrowFunction();
                assert.fail("Expected to throw");
            } catch (e) {
                // no-op
            }

            if (onComplete === null) {
                assert.fail();
                return;
            }
            onComplete();
            return runningPromise;
        };

        it("should throw if run is called while a run is in progress", () => {
            return expectThrow(() => taskRunner.run("root"));
        });

        it("should throw if addDependencies is called while a run is in progress", () => {
            return expectThrow(() => taskRunner.addDependencies("root", "other"));
        });

        it("should throw if removeDependencies is called while a run is in progress", () => {
            return expectThrow(() => taskRunner.removeDependencies("root", "other"));
        });

        it("should throw if addTask is called while a run is in progress", () => {
            const task: Task<any> = mock();
            return expectThrow(() => taskRunner.addTask("other", task)).then(() => verify(task));
        });

        it("should throw if removeTask is called while a run is in progress", () => {
            return expectThrow(() => taskRunner.removeTask("other"));
        });
    });

    describe("getTaskList", () => {
        it("should return an empty map if no tasks are added", () => {
            assert.deepEqual(taskRunner.getTaskList(), {});
        });

        it("should return a single task if only one task exists", () => {
            const task: Task<any> = mock();
            taskRunner.addTask("root", task);
            assert.deepEqual(taskRunner.getTaskList(), {
                "root": []
            });
            verify(task);
        });

        it("should return every task and all dependencies", () => {
            addTask("child2");
            addTask("child1", ["child2"]);
            addTask("root", ["child1", "child2"]);

            assert.deepEqual(taskRunner.getTaskList(), {
                "child2": [],
                "child1": ["child2"],
                "root": ["child1", "child2"]
            });
        });
    });

    describe("onTaskStart, onTaskEnd", () => {
        it("should call onTaskStart when tasks start", () => {
            const onTaskStart: OnTaskStart = mock("onTaskStart");
            const onTaskEnd: OnTaskEnd = mock("onTaskEnd");
            taskRunner = new TaskRunner({ onTaskStart: onTaskStart, onTaskEnd: onTaskEnd });

            expect(onTaskStart).withArgs("root", []);
            expect(onTaskEnd).withArgs("root");

            taskRunner.addTask("root", [], () => {
                // no-op
            });

            return taskRunner.run("root")
                .then(() => {
                    verify(onTaskStart, onTaskEnd);
                });
        });

        it("should call onTaskEnd when the task has ended", () => {
            const onTaskEnd: OnTaskEnd = mock("onTaskEnd");
            taskRunner = new TaskRunner({ onTaskEnd: onTaskEnd });

            const child1 = addTask("child1");

            expect(child1).once();
            expect(onTaskEnd).withArgs("child1");
            expect(onTaskEnd).withArgs("root");

            taskRunner.addTask("root", ["child1"], () => {
                // no-op
            });

            return taskRunner.run("root").then(() => {
                verify(onTaskEnd);
            });
        });

        it("should call onTaskStart and onTaskEnd for each task", () => {
            const onTaskStart: OnTaskStart = mock("onTaskStart");
            const onTaskEnd: OnTaskEnd = mock("onTaskEnd");

            taskRunner = new TaskRunner({ onTaskStart: onTaskStart, onTaskEnd: onTaskEnd });

            const child2 = addTask("child2");
            const child1 = addTask("child1", ["child2"]);
            const root = addTask("root", ["child1", "child2"]);

            expect(child2).once();
            expect(child1).once();
            expect(root).once();

            expect(onTaskEnd).withArgs("child2");
            expect(onTaskEnd).withArgs("child1");
            expect(onTaskEnd).withArgs("root");

            expect(onTaskStart).withArgs("child2", []);
            expect(onTaskStart).withArgs("child1", ["child2"]);
            expect(onTaskStart).withArgs("root", ["child1", "child2"]);

            return taskRunner.run("root").then(() => {
                verify(onTaskStart, onTaskEnd);
            });
        });
    });
});