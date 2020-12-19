export default function EventDispatcher() {}

Object.assign(EventDispatcher.prototype, {
    onceEventListener: function (type, listener) {
        if (this.hasEventListener(type, listener)) {
            return this;
        }
        listener.type = "once";
        this.addEventListener(type, listener);
        return this;
    },
    addEventListener: function (type, listener) {
        if (this._listeners === undefined) this._listeners = {};

        var listeners = this._listeners;

        if (listeners[type] === undefined) {
            listeners[type] = [];
        }

        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
        return this;
    },

    hasEventListener: function (type, listener) {
        if (this._listeners === undefined) return false;

        var listeners = this._listeners;
        return (
            listeners[type] !== undefined &&
            listeners[type].indexOf(listener) !== -1
        );
    },

    removeEventListener: function (type, listener) {
        if (this._listeners === undefined) return;

        var listeners = this._listeners;
        var listenerArray = listeners[type];

        if (listenerArray !== undefined) {
            var index = listenerArray.indexOf(listener);

            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    },

    dispatchEvent: function (event) {
        if (this._listeners === undefined) return;

        var listeners = this._listeners;
        var listenerArray = listeners[event.type];

        if (listenerArray !== undefined) {
            event.target = this;

            var array = listenerArray.slice(0);

            for (var i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
                if (array[i].type === "once") {
                    this.removeEventListener(event.type, array[i]);
                }
            }
        }
    },
});

export const START = "start";
export const STOP = "stop";
export const FINISH = "finish";
export const COMPLETE = "complete";
export const PAUSE = "pause";
export const RESUME = "resume";
export const UPDATE = "update";
export const BEFORE_FINISH = "beforeFinish";
