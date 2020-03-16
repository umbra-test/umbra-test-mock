"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Promisifier {
    wrap(fn) {
        return (results) => {
            if (fn.length === 2) {
                return new Promise((resolve, reject) => {
                    fn(results, (result) => {
                        if (result instanceof Error) {
                            reject(result);
                        }
                        else {
                            resolve(result);
                        }
                    });
                });
            }
            else {
                try {
                    return Promise.resolve(fn(results));
                }
                catch (e) {
                    return Promise.reject(e);
                }
            }
        };
    }
}
exports.Promisifier = Promisifier;
//# sourceMappingURL=Promisifier.js.map