import EventDispatcher, {
    START,
    STOP,
    FINISH,
    COMPLETE,
    PAUSE,
    RESUME,
} from "./EventDispatcher.js";
import Arrange from "./Arrange.js";
import Segment from "./Segment.js";

export default class TimeLine extends EventDispatcher {
    constructor() {
        super();
        this._segments = [];
        this._currentArrange;
        this._isPlaying = false;
        this._isPaused = false;
        this._repeat = 1;

        this._arrangements = [];
    }

    addSegment(...segments) {
        segments.forEach((segment) => {
            if (!(segment instanceof Segment))
                throw new Error("not instanceof Segment!");
        });
        this._segments.push(...segments);
    }

    pushForwardArrange() {
        let arrange = new Arrange(this._segments);
        arrange.forward();
        arrangeEventBind.call(this, arrange);
        this._arrangements.push(arrange);
        return arrange;
    }

    pushBackArrange() {
        let arrange = new Arrange(this._segments);
        arrange.back();
        arrangeEventBind.call(this, arrange);
        this._arrangements.push(arrange);
        return arrange;
    }

    getArrangements() {
        return this._arrangements;
    }

    clearArrangements() {
        this._arrangements = [];
    }

    start(...target) {
        if (this._isPlaying) {
            return false;
        }

        let customArrange;
        let customSegment;

        if (target.length > 0) {
            if (target.length === 1) {
                customSegment = target[0];
            } else {
                customArrange = target[0];
                customSegment = target[1];
            }
        }

        this._isPlaying = true;
        this._isPaused = false;

        let length = this._arrangements.length;
        //如果没有追加排列那么默认正序排列
        if (length === 0) {
            let defaultArrange = this.pushForwardArrange();
            //使用默认排序后会清理排序集合
            this._defaultArrangeForPrevFinishCallback = () => {
                defaultArrange.removeEventListener(
                    FINISH,
                    this._defaultArrangeForPrevFinishCallback
                );
                this._defaultArrangeForPrevFinishCallback = undefined;
                this.clearArrangements();
            };
            defaultArrange.addEventListener(
                FINISH,
                this._defaultArrangeForPrevFinishCallback
            );
            length = 1;
        }

        for (let i = 0; i < length; i++) {
            let currentArrange = this._arrangements[i];
            let nextArrange = this._arrangements[i + 1];
            if (
                currentArrange instanceof Arrange &&
                nextArrange instanceof Arrange
            ) {
                currentArrange.chain(nextArrange);
            }
        }

        //如果自定义了开始的排序
        if (
            customArrange instanceof Arrange &&
            this._arrangements.includes(customArrange)
        ) {
            this._startArrange = customArrange;
        } else {
            this._startArrange = this._arrangements[0];
        }
        this._endArrange = this._arrangements[length - 1];

        //已经循环的次数
        if (
            this._endArrange.hasEventListener(
                FINISH,
                this._endArrangeEventListenerFn
            )
        ) {
            this._endArrange.removeEventListener(
                FINISH,
                this._endArrangeEventListenerFn
            );
        }
        let repeat = 0;
        this._endArrangeEventListenerFn = () => {
            if (!this._isPlaying) return;
            repeat++;
            //如果完成规定次数则停止
            if (repeat >= this._repeat || this._needStop) {
                this._isPlaying = false;
                //并且移除该事件
                this._endArrange.removeEventListener(
                    FINISH,
                    this._endArrangeEventListenerFn
                );
                this._endArrangeEventListenerFn = undefined;
                //如果是自然结束
                if (repeat >= this._repeat && !this._needStop) {
                    this.dispatchEvent({
                        type: COMPLETE
                    });
                }
                //如果结束，当前排序是最后排序则触发事件
                if (this._currentArrange === this._endArrange) {
                    this._needStop = false;
                    this.dispatchEvent({
                        type: FINISH
                    });
                }
                //否则再次重头开始
            } else {
                this._startArrange.start();
            }
        };
        this._endArrange.addEventListener(FINISH, this._endArrangeEventListenerFn);

        //开始事件
        if (
            this._startArrange.hasEventListener(
                START,
                this._startArrangeCompleteCallback
            )
        ) {
            this._startArrange.removeEventListener(
                START,
                this._startArrangeCompleteCallback
            );
        }
        this._startArrangeCompleteCallback = () => {
            this._startArrange.removeEventListener(
                START,
                this._startArrangeCompleteCallback
            );
            this._startArrangeCompleteCallback = undefined;
            this.dispatchEvent({
                type: START
            });
        };
        this._startArrange.addEventListener(
            START,
            this._startArrangeCompleteCallback
        );

        this._startArrange.start(customSegment);
    }

    // pushReverse() {}

    repeat(_repeat) {
        if (typeof _repeat !== "number" || _repeat <= 0)
            throw new Error("Invalid repeat!");
        this._repeat = _repeat;
    }

    loop() {
        this._repeat = Infinity;
    }

    stop() {
        if (!this._isPlaying) {
            return false;
        }

        if (this._currentArrange instanceof Arrange) {
            this._needStop = true;
            //如果当前排序不是最后一个片段，则手动触发结束标志
            if (this._currentArrange !== this._endArrange) {
                this._isPlaying = false;
            }
            let currentArrange = this._currentArrange;
            let endArrange = this._endArrange;

            //如果当前排序不是最后一个片段，则手动触发结束事件
            if (currentArrange !== endArrange) {
                this._needStop = false;
                if (
                    this._currentArrange.hasEventListener(
                        FINISH,
                        this._currentArrangeFinishForStopCallback
                    )
                ) {
                    this._currentArrange.removeEventListener(
                        FINISH,
                        this._currentArrangeFinishForStopCallback
                    );
                }
                this._currentArrangeFinishForStopCallback = () => {
                    this._currentArrange.removeEventListener(FINISH, this._currentArrangeFinishForStopCallback);
                    this._currentArrangeFinishForStopCallback = undefined;
                    this.dispatchEvent({
                        type: FINISH
                    });
                }
                this._currentArrange.addEventListener(FINISH, this._currentArrangeFinishForStopCallback);

                //并且移除最后

            }

            this._currentArrange.stop();
            this.dispatchEvent({
                type: STOP
            });
        }
    }

    pause() {
        if (!this._isPlaying || this._isPaused) {
            return false;
        }
        if (this._currentArrange instanceof Arrange) {

            if (
                this._currentArrange.hasEventListener(
                    PAUSE,
                    this._currentArrangePauseCallback
                )
            ) {
                this._currentArrange.removeEventListener(
                    PAUSE,
                    this._currentArrangePauseCallback
                );
            }
            this._currentArrangePauseCallback = () => {
                this._isPaused = true;
                this._currentArrange.removeEventListener(PAUSE, this._currentArrangePauseCallback);
                this._currentArrangePauseCallback = undefined;
                this.dispatchEvent({
                    type: PAUSE
                });
            }
            this._currentArrange.addEventListener(PAUSE, this._currentArrangePauseCallback);

            this._currentArrange.pause();
        }
    }

    resume() {
        if (!this._isPlaying || !this._isPaused) {
            return false;
        }
        if (this._currentArrange instanceof Arrange) {
            if (
                this._currentArrange.hasEventListener(
                    RESUME,
                    this._currentArrangeResumeCallback
                )
            ) {
                this._currentArrange.removeEventListener(
                    RESUME,
                    this._currentArrangeResumeCallback
                );
            }
            this._currentArrangeResumeCallback = () => {
                this._isPaused = false;
                this._currentArrange.removeEventListener(RESUME, this._currentArrangeResumeCallback);
                this._currentArrangeResumeCallback = undefined;
                this.dispatchEvent({
                    type: RESUME
                });
            }
            this._currentArrange.addEventListener(RESUME, this._currentArrangeResumeCallback);
            this._currentArrange.resume();
        }
    }

    execute(...target) {
        let arrange;
        let segment;

        if (target.length === 0) {
            return false;
        } else if (target.length === 1) {
            segment = target[0];
        } else {
            arrange = target[0];
            segment = target[1];
        }

        if (!this._isPlaying ||
            !(segment instanceof Segment) ||
            this._executeing
        ) {
            return false;
        }

        this._executeing = true;

        let isPaused = this._isPaused;

        //如果存在_executeForPrevFinishCallback就先移除，有了_switching，可能并不需要但是为了保险
        if (this.hasEventListener(FINISH, this._executeForPrevFinishCallback)) {
            this.removeEventListener(FINISH, this._executeForPrevFinishCallback);
        }
        this._executeForPrevFinishCallback = () => {
            //如果是暂停的就切换到对应segment后执行完就暂停
            if (isPaused) {
                if (
                    segment.hasEventListener(
                        FINISH,
                        this._executeForTargetSegmentFinishCallback
                    )
                ) {
                    segment.removeEventListener(
                        FINISH,
                        this._executeForTargetSegmentFinishCallback
                    );
                }
                this._executeForTargetSegmentFinishCallback = () => {
                    this.pause();
                    this._executeing = false;
                    segment.removeEventListener(
                        FINISH,
                        this._executeForTargetSegmentFinishCallback
                    );
                    this._executeForTargetSegmentFinishCallback = undefined;
                };
                segment.addEventListener(
                    FINISH,
                    this._executeForTargetSegmentFinishCallback
                );
            } else {
                this._executeing = false;
            }

            if (arrange) {
                this.start(arrange, segment);
            } else {
                this.start(segment);
            }

            this.removeEventListener(
                FINISH,
                this._executeForPrevFinishCallback
            );
            this._executeForPrevFinishCallback = undefined;

        };
        this.addEventListener(FINISH, this._executeForPrevFinishCallback);

        //无论如何先停止
        this.stop();
    }

    switch (...target) {
        let arrange;
        let segment;

        if (target.length === 0) {
            return false;
        } else if (target.length === 1) {
            segment = target[0];
        } else {
            arrange = target[0];
            segment = target[1];
        }

        if (!this._isPlaying ||
            !(segment instanceof Segment) ||
            this._switching
        ) {
            return false;
        }

        this._switching = true;

        let isPaused = this._isPaused;

        //如果存在_switchFinishCallback就先移除，有了_switching，可能并不需要但是为了保险
        if (this.hasEventListener(FINISH, this._switchForPrevFinishCallback)) {
            this.removeEventListener(FINISH, this._switchForPrevFinishCallback);
        }
        this._switchForPrevFinishCallback = () => {
            //如果是暂停的就切换到对应arrange 和 segment后就暂停
            if (isPaused) {
                if (
                    this.hasEventListener(
                        START,
                        this._switchForStartAfterCallback
                    )
                ) {
                    this.removeEventListener(
                        START,
                        this._switchForStartAfterCallback
                    );
                }
                this._switchForStartAfterCallback = () => {
                    this.pause();
                    this._switching = false;
                    this.removeEventListener(
                        START,
                        this._switchForStartAfterCallback
                    );
                    this._switchForStartAfterCallback = undefined;
                };
                this.addEventListener(START, this._switchForStartAfterCallback);
            } else {
                this._switching = false;
            }
            if (arrange) {
                this.start(arrange, segment);
            } else {
                this.start(segment);
            }
            this.removeEventListener(FINISH, this._switchForPrevFinishCallback);
            this._switchForPrevFinishCallback = undefined;
        };
        this.addEventListener(FINISH, this._switchForPrevFinishCallback);

        //无论如何先停止
        this.stop();
    }
}

function arrangeEventBind(arrange) {
    arrange.addEventListener(START, () => {
        if (!this._isPlaying) return;
        this._currentArrange = arrange;
    });
    // arrange.addEventListener(PAUSE, () => {
    //     this.dispatchEvent({ type: PAUSE });
    // });
    // arrange.addEventListener(RESUME, () => {
    //     this.dispatchEvent({ type: RESUME });
    // });
    // arrange.addEventListener(STOP, () => {
    //     this.dispatchEvent({ type: STOP });
    // });
    // arrange.addEventListener(FINISH, () => {
    //     //排除特殊的最后一位，最后一位单独处理，如衔接下一位排序
    //     if (arrange === this._endArrange) return;

    //     this._isPlaying = false;
    //     this.dispatchEvent({ type: FINISH });
    // });
}