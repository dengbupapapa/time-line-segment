import EventDispatcher, {
    START,
    STOP,
    FINISH,
    COMPLETE,
    PAUSE,
    RESUME,
} from "./EventDispatcher.js";
import Segment from "./Segment.js";
export default class Arrange extends EventDispatcher {
    constructor(segments) {
        super();
        this._segments = segments;
        this._type = "forward";

        this._isPlaying = false;
        this._isPaused = false;

        //监听片段执行开始时回调
        let length = this._segments.length;
        for (let i = 0; i < length; i++) {
            let currentSegment = this._segments[i];

            currentSegment.addEventListener(START, () => {
                //如果排序处于停止状态则取消监听
                if (!this._isPlaying) return;
                this._currentSegment = currentSegment;
            });

            // currentSegment.addEventListener(PAUSE, () => {
            //     //如果排序处于停止状态则取消监听
            //     if (!this._isPlaying) return;
            //     this.dispatchEvent({ type: PAUSE });
            // });

            // currentSegment.addEventListener(RESUME, () => {
            //     //如果排序处于停止状态则取消监听
            //     if (!this._isPlaying) return;
            //     this.dispatchEvent({ type: RESUME });
            // });

            // currentSegment.addEventListener(STOP, () => {
            //     //如果排序处于停止状态则取消监听
            //     if (!this._isPlaying) return;
            //     this.dispatchEvent({ type: STOP });
            // });

            // currentSegment.addEventListener(FINISH, ({ transactions }) => {
            //     //如果排序处于停止状态则取消监听
            //     if (!this._isPlaying) return;
            //     //排除特殊的最后一位，最后一位单独处理
            //     if (currentSegment === this._endSegment) return;

            //     let result = transactions.map(({ finishType }) => finishType);
            //     //如果存在一个complete就表示不会停止，那么在排序中就不算结束。
            //     if (result.includes("complete")) return;

            //     this._isPlaying = false;

            //     this.dispatchEvent({ type: FINISH });
            // });
        }
    }

    // disable() {
    //     this._enabled = false;
    // }
    // enable() {
    //     this._enabled = true;
    // }

    //可以自定义开始位置
    start(customSegment) {
        if (this._isPlaying) {
            return false;
        }
        this._isPlaying = true;
        this._isPaused = false;

        // let enabled = this._enabled;
        // this.enable();

        if (!arrangeMode.hasOwnProperty(this._type)) {
            this._isPlaying = false;
            // this._enabled = enabled;
            throw new Error("not set arrange type!");
        }

        //开始之前先重新链接，并定义开始片段，结束片段
        arrangeMode[this._type].call(this, customSegment);

        if (
            !(this._startSegment instanceof Segment) ||
            typeof this._startSegmentStart !== "function"
        ) {
            this._isPlaying = false;
            // this._enabled = enabled;
            throw new Error("start segment not instanceof Segment!");
        }

        /*结束*/
        //如果存在未完成的结束事件回调则先移除
        if (
            this._endSegment.hasEventListener(
                FINISH,
                this._endSegmentFinishCallback
            )
        ) {
            this._endSegment.removeEventListener(
                FINISH,
                this._endSegmentFinishCallback
            );
        }
        //结束事件回调
        this._endSegmentFinishCallback = ({ transactions }) => {
            if (!this._isPlaying) return;
            this._isPlaying = false;

            //完成后移除回调
            this._endSegment.removeEventListener(
                FINISH,
                this._endSegmentFinishCallback
            );
            this._endSegmentFinishCallback = undefined;

            let result = transactions.map(({ finishType }) => finishType);
            //如果有定义下一个衔接的片段，并且没有全部停止，接衔接
            if (
                typeof this._nextArrangeStrat === "function" &&
                result.includes("complete")
            ) {
                if (
                    this._nextArrange.hasEventListener(
                        START,
                        this._currentArrangeFinish2nextArrangeStartCallback
                    )
                ) {
                    this._nextArrange.removeEventListener(
                        START,
                        this._currentArrangeFinish2nextArrangeStartCallback
                    );
                }
                this._currentArrangeFinish2nextArrangeStartCallback = () => {
                    this._nextArrange.removeEventListener(
                        START,
                        this._currentArrangeFinish2nextArrangeStartCallback
                    );
                    this._currentArrangeFinish2nextArrangeStartCallback = null;
                    this.dispatchEvent({ type: FINISH });
                };
                this._nextArrange.addEventListener(
                    START,
                    this._currentArrangeFinish2nextArrangeStartCallback
                );

                this._nextArrangeStrat();
            }else{
                this.dispatchEvent({ type: FINISH });
            }

            // this.disable();
        };

        this._endSegment.addEventListener(
            FINISH,
            this._endSegmentFinishCallback
        );

        /*完整的结束*/
        //如果存在未完成的完整结束事件回调则先移除
        if (
            this._endSegment.hasEventListener(
                COMPLETE,
                this._endSegmentCompleteCallback
            )
        ) {
            this._endSegment.removeEventListener(
                COMPLETE,
                this._endSegmentCompleteCallback
            );
        }
        this._endSegmentCompleteCallback = (event) => {
            //如果事件监听处于关闭状态则取消监听
            if (!this._isPlaying) return;

            //完成后移除回调
            this._endSegment.removeEventListener(
                COMPLETE,
                this._endSegmentCompleteCallback
            );
            this._endSegmentCompleteCallback = undefined;

            this.dispatchEvent({ type: COMPLETE });
        };
        this._endSegment.addEventListener(
            COMPLETE,
            this._endSegmentCompleteCallback
        );

        //开始事件
        if (
            this._startSegment.hasEventListener(
                START,
                this._startSegmentCompleteCallback
            )
        ) {
            this._startSegment.removeEventListener(
                START,
                this._startSegmentCompleteCallback
            );
        }
        this._startSegmentCompleteCallback = () => {
            this._startSegment.removeEventListener(
                START,
                this._startSegmentCompleteCallback
            );
            this._startSegmentCompleteCallback = undefined;
            this.dispatchEvent({ type: START });
        };
        this._startSegment.addEventListener(
            START,
            this._startSegmentCompleteCallback
        );

        this._startSegmentStart();
    }

    stop() {
        if (!this._isPlaying) {
            return false;
        }
        if (this._currentSegment instanceof Segment) {
            if (this._currentSegment !== this._endSegment) {
                this._isPlaying = false;
            }
            this._currentSegment.stop();
            this.dispatchEvent({ type: STOP });
            if (this._currentSegment !== this._endSegment) {
                this.dispatchEvent({ type: FINISH });
            }
        }
    }

    pause() {
        if (!this._isPlaying || this._isPaused) {
            return false;
        }
        if (this._currentSegment instanceof Segment) {
            this._isPaused = true;
            this._currentSegment.pause();
            this.dispatchEvent({ type: PAUSE });
        }
    }

    resume() {
        if (!this._isPlaying || !this._isPaused) {
            return false;
        }
        if (this._currentSegment instanceof Segment) {
            this._isPaused = false;
            this._currentSegment.resume();
            this.dispatchEvent({ type: RESUME });
        }
    }

    chain(nextArrange) {
        if (nextArrange instanceof Arrange) {
            this._nextArrange = nextArrange;
            this._nextArrangeStrat = nextArrange.start.bind(nextArrange);
        }
    }

    removeChain() {
        delete this._nextArrange;
        delete this._nextArrangeStrat;
    }

    execute(segment) {
        if (
            !this._isPlaying ||
            !(segment instanceof Segment) ||
            this._executeing
        ) {
            return false;
        }

        this._executeing = true;

        let isPaused = this._isPaused;

        //如果存在_executeFinishCallback就先移除，有了_executeing，可能并不需要但是为了保险
        if (this.hasEventListener(FINISH, this._executeForPrevFinishCallback)) {
            this.removeEventListener(
                FINISH,
                this._executeForPrevFinishCallback
            );
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

            this.start(segment);

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

    switch(segment) {
        if (
            !this._isPlaying ||
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
            //如果是暂停的就切换到对应segment后就暂停
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
            this.start(segment);
            this.removeEventListener(FINISH, this._switchForPrevFinishCallback);
            this._switchForPrevFinishCallback = undefined;
        };
        this.addEventListener(FINISH, this._switchForPrevFinishCallback);

        //无论如何先停止
        this.stop();
    }

    forward() {
        this._type = "forward";
    }

    back() {
        this._type = "back";
    }
}

let arrangeMode = {
    discrete() {
        let length = this._segments.length;
        for (let i = 0; i < length; i++) {
            this._segments[i].removeChain();
        }
    },

    forward(customSegment) {
        arrangeMode.discrete.call(this);
        let length = this._segments.length;
        for (let i = 0; i < length; i++) {
            let currentSegment = this._segments[i];
            let nextSegment = this._segments[i + 1];

            //只有当前片段和下一片段都存在的情况才能使用chain
            if (
                currentSegment instanceof Segment &&
                nextSegment instanceof Segment
            ) {
                currentSegment.chain(nextSegment);
            }
        }

        if (
            customSegment instanceof Segment &&
            this._segments.includes(customSegment)
        ) {
            this._startSegment = customSegment;
        } else {
            this._startSegment = this._segments[0];
        }

        this._startSegmentStart = this._startSegment.start.bind(
            this._startSegment
        );

        this._endSegment = this._segments[length - 1];
    },
    back(customSegment) {
        arrangeMode.discrete.call(this);
        let length = this._segments.length;
        this._endSegment = this._segments[0];
        for (let i = length - 1; i >= 0; i--) {
            let currentSegment = this._segments[i];
            let nextSegment = this._segments[i - 1];

            //只有当前片段和下一片段都存在的情况才能使用chain
            if (
                currentSegment instanceof Segment &&
                nextSegment instanceof Segment
            ) {
                currentSegment.chain(nextSegment, true);
            }
        }
        if (
            customSegment instanceof Segment &&
            this._segments.includes(customSegment)
        ) {
            this._startSegment = customSegment;
        } else {
            this._startSegment = this._segments[length - 1];
        }
        this._startSegmentStart = this._startSegment.playback.bind(
            this._startSegment
        );
        this._endSegment = this._segments[0];
    },
};
