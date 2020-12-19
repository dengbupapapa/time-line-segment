import TWEEN from "./tween.esm.js";
import EventDispatcher, {
    START,
    STOP,
    FINISH,
    COMPLETE,
    BEFORE_FINISH,
    PAUSE,
    RESUME,
    UPDATE,
} from "./EventDispatcher.js";
import TimeLine from "./TimeLine.js";
//tween最小过渡时间
const minDuration = 100;
const placeholderTransaction = Symbol();
export default class Segment extends EventDispatcher {
    constructor() {
        super();
        this._transactions = [];
        this._totalTime = minDuration;

        let placeholderTransactionFn = (
            time,
            elapsed,
            globalPercent,
            totalTime
        ) => {
            //为了防止超标，且保留结束前的事件
            globalPercent = globalPercent > 1 ? 1 : globalPercent;
            time = time > this._totalTime ? this._totalTime : time;
            this.dispatchEvent({
                type: UPDATE,
                time,
                elapsed,
                globalPercent,
                totalTime,
            });
        };
        let tween = createTween.call(this, {
            type: "interval",
            value: [0, minDuration],
            fn: placeholderTransactionFn,
        });
        this._transactions[0] = {
            tween,
            fn: placeholderTransactionFn,
            name: placeholderTransaction,
            type: "interval",
            value: [0, minDuration],
        };
        //为了回放有正确的结尾等待，顾创建一个默认从0开始到结束的transaction。
        // updatePlaceholderTransactionDuration.call(this);
    }

    setName(name) {
        this._name = name;
    }

    getName() {
        return this._name;
    }

    setId(id) {
        this._id = id;
    }

    getId() {
        return this._id;
    }

    start(...names) {
        segmentRun.call(this, ...names, false);
    }

    forceStart(...names) {
        let transactions;

        if (names.length > 0) {
            transactions = this._transactions.filter(({ name }) =>
                names.includes(name)
            );
        } else {
            transactions = this._transactions;
        }

        if (transactions.length === 0) return false;

        transactions.forEach(({ tween }) => {
            tween.stop();
        });
        this.start(...names);
    }

    playback(...names) {
        segmentRun.call(this, ...names, true);
    }

    forcePlayback(...names) {
        let transactions;

        if (names.length > 0) {
            transactions = this._transactions.filter(({ name }) =>
                names.includes(name)
            );
        } else {
            transactions = this._transactions;
        }

        if (transactions.length === 0) return false;

        transactions.forEach(({ tween }) => {
            tween.stop();
        });
        this.playback(...names);
    }

    stop(...names) {
        // if (!this._isPlaying) return false;

        // this._isPlaying = false;

        let transactions;

        if (names.length > 0) {
            transactions = this._transactions.filter((transaction) => {
                let { name, tween } = transaction;
                //执行了stop的事务强行标识为stop，防止有提前完成的事务标识为complete导致，链接到下一个片段上。（我们链接下一位的条件是片段只要有一个事务为complete就可以触发下一位）
                if (names.includes(name)) transaction.finishType = "stop";
                return names.includes(name) && tween._isPlaying;
            });
        } else {
            transactions = this._transactions.filter((transaction) => {
                //执行了stop的事务强行标识为stop，防止有提前完成的事务标识为complete导致，链接到下一个片段上。（我们链接下一位的条件是片段只要有一个事务为complete就可以触发下一位）
                let { tween } = transaction;
                transaction.finishType = "stop";
                return tween._isPlaying;
            });
        }

        if (transactions.length === 0) return false;

        let stopElements = transactions.map(({ tween, fn }) => {
            return new Promise((resolve) => {
                if (tween._isPlaying === false) {
                    resolve();
                } else {
                    tween._onStop(() => {
                        resolve();
                    });
                }
            });
        });

        Promise.all(stopElements).then(() => {
            this.dispatchEvent({ type: STOP, transactions });
        });

        transactions.forEach(({ tween }) => {
            tween.stop();
        });
    }

    pause(...names) {
        //暂停中或非运行中就阻止
        // if (this._isPaused || !this._isPlaying) return false;

        // this._isPaused = true;

        let transactions;

        if (names.length > 0) {
            transactions = this._transactions.filter(
                ({ name, tween }) =>
                    names.includes(name) && !tween._isPaused && tween._isPlaying
            );
        } else {
            transactions = this._transactions.filter(
                ({ tween }) => !tween._isPaused && tween._isPlaying
            );
        }

        if (transactions.length === 0) return false;
        let pauseElements = transactions.map(({ tween, fn }) => {
            return new Promise((resolve) => {
                // if (tween._isPlaying === false) {
                //     resolve();
                // } else {
                tween._onPause(() => {
                    resolve();
                });
                // }
            });
        });

        Promise.all(pauseElements).then(() => {
            this.dispatchEvent({ type: PAUSE, transactions });
        });

        transactions.forEach(({ tween }) => {
            tween.pause();
        });
    }

    resume(...names) {
        //没有暂停或非运行中就阻止
        // if (!this._isPaused || !this._isPlaying) return false;

        // this._isPaused = false;

        let transactions;

        if (names.length > 0) {
            transactions = this._transactions.filter(
                ({ name, tween }) =>
                    names.includes(name) && tween._isPaused && tween._isPlaying
            );
        } else {
            transactions = this._transactions.filter(
                ({ tween }) => tween._isPaused && tween._isPlaying
            );
        }

        if (transactions.length === 0) return false;

        let resumeElements = transactions.map(({ tween, fn }) => {
            return new Promise((resolve) => {
                // if (tween._isPlaying === false) {
                //     resolve();
                // } else {
                tween._onResume(() => {
                    resolve();
                });
                // }
            });
        });

        Promise.all(resumeElements).then(() => {
            this.dispatchEvent({ type: RESUME, transactions });
        });

        transactions.forEach(({ tween }) => {
            tween.resume();
        });
    }

    chain(nextSegment, ...names) {
        if (nextSegment instanceof Segment) {
            //是否执行回放
            let playback = false;
            if (typeof names[names.length - 1] === "boolean") {
                playback = names.pop();
            }
            this._nextSegment = nextSegment;

            if (!playback) {
                this._nextSegmentStrat = nextSegment.start.bind(
                    nextSegment,
                    ...names
                );
            } else {
                this._nextSegmentStrat = nextSegment.playback.bind(
                    nextSegment,
                    ...names
                );
            }
        }
        return this;
    }

    removeChain() {
        delete this._nextSegment;
        delete this._nextSegmentStrat;
    }

    transaction(...arg) {
        let transactionArguments = formatTransactionArguments.apply(this, arg);
        this._transactions.push(transactionArguments);
        return this;
    }

    removeTransaction(...names) {
        if (names.length === 0) return;

        let prevLength = this._transactions.length;
        this._transactions = this._transactions.filter(
            ({ name, id }) =>
                (!names.includes(name) && !names.includes(id)) ||
                name === placeholderTransaction
        );
        let currentLength = this._transactions.length;

        if (prevLength === currentLength) return;

        this._totalTime = 0;
        this._transactions.forEach(({ type, value }) => {
            if (type === "point") {
                this._totalTime = Math.max(this._totalTime, value);
            } else if (type === "interval") {
                this._totalTime = Math.max(this._totalTime, value[1]);
            } else {
                throw new Error("transaction type error!");
            }
            updatePlaceholderTransactionDuration.call(this);
        });
    }

    editTransaction(identify, ...arg) {
        this._transactions.forEach((transaction, i) => {
            let { name, id } = transaction;
            if (identify === name || identify === id) {
                this._transactions[i] = formatTransactionArguments.apply(
                    this,
                    arg
                );
            }
        });
    }

    getTotalTime() {
        return this._totalTime;
    }
}

function updatePlaceholderTransactionDuration() {
    //为了回放有正确的结尾等待，顾创建一个默认从0开始的transaction。
    // let placeholderTransactionFn = (
    //     time,
    //     elapsed,
    //     globalPercent,
    //     totalTime
    // ) => {
    //     //为了防止超标，且保留结束前的事件
    //     globalPercent = globalPercent > 1 ? 1 : globalPercent;
    //     time = time > this._totalTime ? this._totalTime : time;
    //     this.dispatchEvent({
    //         type: UPDATE,
    //         time,
    //         elapsed,
    //         globalPercent,
    //         totalTime,
    //     });
    // };
    // let endTime = this._totalTime + minDuration;
    // let tween = createTween.call(this, {
    //     type: "interval",
    //     value: [0, endTime],
    //     fn: placeholderTransactionFn,
    // });
    // this._transactions[0] = {
    //     tween,
    //     fn: placeholderTransactionFn,
    //     name: placeholderTransaction,
    //     type: "interval",
    //     value: [0, endTime],
    // };

    let endTime = this._totalTime + minDuration;
    this._transactions[0].tween.to(
        {
            time: endTime,
        },
        endTime
    );

    this._transactions[0].tween._onUpdate(({ time }) => {
        let percent = time / endTime;
        let globalPercent = time / endTime;
        this._transactions[0].fn(time, percent, globalPercent, this._totalTime);
    });
}

function formatTransactionArguments(...arg) {
    let options = {};
    if (
        Object.prototype.toString.call(arg[arg.length - 1]) ===
        "[object Object]"
    ) {
        options = arg.pop();
    }

    let { name, id, easing = TimeLine.Easing.Linear.None } = options;

    if (typeof easing !== "function") {
        throw new Error("easing is function!");
    }

    if (
        typeof name !== "undefined" &&
        typeof name !== "string" &&
        typeof name !== "number"
    ) {
        throw new Error("name is string or number!");
    }

    if (
        typeof id !== "undefined" &&
        typeof id !== "string" &&
        typeof id !== "number"
    ) {
        throw new Error("id is string or number!");
    }

    let fn = arg.pop();
    //此参数必须为fn
    if (typeof fn !== "function") {
        throw new Error("You need to pass in a function!");
    }

    if (arg.length === 1) {
        if (typeof arg[0] !== "number" || arg[0] < 0) {
            throw new Error(`Invalid time value! should time >= 0.`);
        }
        let tween = createTween.call(this, {
            type: "point",
            value: arg[0],
            fn,
        });
        this._totalTime = Math.max(this._totalTime, arg[0]);
        updatePlaceholderTransactionDuration.call(this);

        return {
            tween,
            fn,
            name,
            id,
            type: "point",
            value: arg[0],
        };
    } else if (arg.length === 2) {
        if (
            typeof arg[0] !== "number" ||
            typeof arg[1] !== "number" ||
            arg[0] < 0 ||
            arg[1] < 0
        ) {
            throw new Error(`Invalid time value! should time >= 0.`);
        }
        if (arg[0] >= arg[1]) {
            throw new Error("arg[0] < arg[1]!");
        }

        let tween = createTween.call(this, {
            type: "interval",
            value: arg,
            fn,
            easing,
        });
        this._totalTime = Math.max(this._totalTime, arg[1]);
        updatePlaceholderTransactionDuration.call(this);
        return {
            tween,
            fn,
            name,
            id,
            type: "interval",
            value: arg,
        };
    } else {
        throw new Error("Invalid arguments!");
    }
}

function createTween({ type, value, fn, easing }) {
    let tween;

    if (type === "interval") {
        tween = new TWEEN.Tween({
            time: value[0],
        });
        tween.to(
            {
                time: value[1],
            },
            value[1] - value[0]
        );
        tween._onUpdate(({ time }) => {
            let percent = (time - value[0]) / (value[1] - value[0]);
            let globalPercent = time / this._totalTime;
            fn(time, percent, globalPercent, this._totalTime);
        });
        if (easing) tween.easing(easing);
    } else if (type === "point") {
        tween = new TWEEN.Tween({
            time: value,
        });
        tween.duration(minDuration);
    }

    // tween._onStart(({ time }) => {
    //     fn.call(this, time, 0, time / this._totalTime);
    // });
    return tween;
}

function segmentRun(...names) {
    //是否执行回放
    let playback = false;
    if (typeof names[names.length - 1] === "boolean") {
        playback = names.pop();
    }

    let transactions;

    if (names.length > 0) {
        transactions = this._transactions.filter(
            ({ name, tween }) => names.includes(name) && !tween._isPlaying
        );
    } else {
        transactions = this._transactions.filter(
            ({ tween }) => !tween._isPlaying
        );
    }

    if (transactions.length === 0) return false;

    //开始
    let startElements = transactions.map(({ tween, fn }) => {
        return new Promise((resolve) => {
            tween._onStart(({ time }) => {
                fn(time, 0, time / this._totalTime, this._totalTime);
                resolve();
            });
        });
    });

    Promise.race(startElements).then(() => {
        this.dispatchEvent({ type: START, transactions });
    });

    //完整的结束之前
    let beforeFinishElements = transactions.map(({ tween, type, value }) => {
        return new Promise((resolve) => {
            tween._onBeforeFinish(() => {
                resolve();
            });
        });
    });

    Promise.all(beforeFinishElements).then(() => {
        // this._isPlaying = false;
        this.dispatchEvent({ type: BEFORE_FINISH, transactions });
        //如果有定义下一个衔接的片段
        // if (this._nextSegment instanceof Segment) this._nextSegment.start();
    });

    //完整的结束
    let completeElements = transactions.map(({ tween, type, value }) => {
        return new Promise((resolve) => {
            tween._onComplete(() => {
                resolve();
                // if (!playback) {
                //     resolve();
                // } else {
                //     if (type === "interval") {
                //         setTimeout(() => {
                //             resolve();
                //         }, value[0]);
                //     } else if (type === "point") {
                //         setTimeout(() => {
                //             resolve();
                //         }, value);
                //     }
                // }
            });
        });
    });

    Promise.all(completeElements).then(() => {
        // this._isPlaying = false;
        this.dispatchEvent({ type: COMPLETE, transactions });
        //如果有定义下一个衔接的片段
        // if (this._nextSegment instanceof Segment) this._nextSegment.start();
    });

    //结束
    let finishElements = transactions.map((transaction) => {
        let { tween, type, value } = transaction;
        return new Promise((resolve) => {
            tween._onFinish((o, finishType) => {
                transaction.finishType = finishType;
                resolve();
                // if (!playback) {
                //     resolve();
                // } else {
                //     if (type === "interval") {
                //         setTimeout(() => {
                //             resolve();
                //         }, value[0]);
                //     } else if (type === "point") {
                //         setTimeout(() => {
                //             resolve();
                //         }, value);
                //     }
                // }
            });
        });
    });

    Promise.all(finishElements).then(() => {
        let result = transactions.map(({ finishType }) => finishType);
        //如果有定义下一个衔接的片段，并且没有全部停止，接衔接
        if (
            typeof this._nextSegmentStrat === "function" &&
            result.includes("complete")
        ) {
            //先开始在结束，防止_currentSegment有间隙无法正常操作
            if (
                this._nextSegment.hasEventListener(
                    START,
                    this._currentSegmentFinish2nextSegmentStartCallback
                )
            ) {
                this._nextSegment.removeEventListener(
                    START,
                    this._currentSegmentFinish2nextSegmentStartCallback
                );
            }
            this._currentSegmentFinish2nextSegmentStartCallback = () => {
                this._nextSegment.removeEventListener(
                    START,
                    this._currentSegmentFinish2nextSegmentStartCallback
                );
                this._currentSegmentFinish2nextSegmentStartCallback = null;
                this.dispatchEvent({ type: FINISH, transactions });
            };
            this._nextSegment.addEventListener(
                START,
                this._currentSegmentFinish2nextSegmentStartCallback
            );
            this._nextSegmentStrat();
        } else {
            this.dispatchEvent({ type: FINISH, transactions });
        }
    });

    transactions.forEach(({ tween, type, value }) => {
        if (!playback) {
            if (type === "interval") {
                tween.delay(value[0]);
            } else if (type === "point") {
                tween.delay(value);
            }
        } else {
            if (type === "interval") {
                tween.delay(this._totalTime - value[1]);
            } else if (type === "point") {
                tween.delay(this._totalTime - value);
            }
        }
        tween.playback(playback);
        tween.start();
    });

    // this.dispatchEvent({ type: START, transactions });
}
