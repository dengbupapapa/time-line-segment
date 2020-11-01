(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
            (global = global || self, global.TimeLine = factory());
}(this, function () { 'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop() {}

            var on = noop;
            var addListener = noop;
            var once = noop;
            var off = noop;
            var removeListener = noop;
            var removeAllListeners = noop;
            var emit = noop;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            var process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once,
              off: off,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            function unwrapExports (x) {
            	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
            }

            function createCommonjsModule(fn, module) {
            	return module = { exports: {} }, fn(module, module.exports), module.exports;
            }

            var _global = createCommonjsModule(function (module) {
            // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
            var global = module.exports = typeof window != 'undefined' && window.Math == Math
              ? window : typeof self != 'undefined' && self.Math == Math ? self
              // eslint-disable-next-line no-new-func
              : Function('return this')();
            if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
            });

            var _core = createCommonjsModule(function (module) {
            var core = module.exports = { version: '2.6.11' };
            if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
            });
            var _core_1 = _core.version;

            var _aFunction = function (it) {
              if (typeof it != 'function') throw TypeError(it + ' is not a function!');
              return it;
            };

            // optional / simple context binding

            var _ctx = function (fn, that, length) {
              _aFunction(fn);
              if (that === undefined) return fn;
              switch (length) {
                case 1: return function (a) {
                  return fn.call(that, a);
                };
                case 2: return function (a, b) {
                  return fn.call(that, a, b);
                };
                case 3: return function (a, b, c) {
                  return fn.call(that, a, b, c);
                };
              }
              return function (/* ...args */) {
                return fn.apply(that, arguments);
              };
            };

            var _isObject = function (it) {
              return typeof it === 'object' ? it !== null : typeof it === 'function';
            };

            var _anObject = function (it) {
              if (!_isObject(it)) throw TypeError(it + ' is not an object!');
              return it;
            };

            var _fails = function (exec) {
              try {
                return !!exec();
              } catch (e) {
                return true;
              }
            };

            // Thank's IE8 for his funny defineProperty
            var _descriptors = !_fails(function () {
              return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
            });

            var document$1 = _global.document;
            // typeof document.createElement is 'object' in old IE
            var is = _isObject(document$1) && _isObject(document$1.createElement);
            var _domCreate = function (it) {
              return is ? document$1.createElement(it) : {};
            };

            var _ie8DomDefine = !_descriptors && !_fails(function () {
              return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
            });

            // 7.1.1 ToPrimitive(input [, PreferredType])

            // instead of the ES6 spec version, we didn't implement @@toPrimitive case
            // and the second argument - flag - preferred type is a string
            var _toPrimitive = function (it, S) {
              if (!_isObject(it)) return it;
              var fn, val;
              if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
              if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
              if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
              throw TypeError("Can't convert object to primitive value");
            };

            var dP = Object.defineProperty;

            var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
              _anObject(O);
              P = _toPrimitive(P, true);
              _anObject(Attributes);
              if (_ie8DomDefine) try {
                return dP(O, P, Attributes);
              } catch (e) { /* empty */ }
              if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
              if ('value' in Attributes) O[P] = Attributes.value;
              return O;
            };

            var _objectDp = {
            	f: f
            };

            var _propertyDesc = function (bitmap, value) {
              return {
                enumerable: !(bitmap & 1),
                configurable: !(bitmap & 2),
                writable: !(bitmap & 4),
                value: value
              };
            };

            var _hide = _descriptors ? function (object, key, value) {
              return _objectDp.f(object, key, _propertyDesc(1, value));
            } : function (object, key, value) {
              object[key] = value;
              return object;
            };

            var hasOwnProperty = {}.hasOwnProperty;
            var _has = function (it, key) {
              return hasOwnProperty.call(it, key);
            };

            var PROTOTYPE = 'prototype';

            var $export = function (type, name, source) {
              var IS_FORCED = type & $export.F;
              var IS_GLOBAL = type & $export.G;
              var IS_STATIC = type & $export.S;
              var IS_PROTO = type & $export.P;
              var IS_BIND = type & $export.B;
              var IS_WRAP = type & $export.W;
              var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
              var expProto = exports[PROTOTYPE];
              var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
              var key, own, out;
              if (IS_GLOBAL) source = name;
              for (key in source) {
                // contains in native
                own = !IS_FORCED && target && target[key] !== undefined;
                if (own && _has(exports, key)) continue;
                // export native or passed
                out = own ? target[key] : source[key];
                // prevent global pollution for namespaces
                exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
                // bind timers to global for call from export context
                : IS_BIND && own ? _ctx(out, _global)
                // wrap global constructors for prevent change them in library
                : IS_WRAP && target[key] == out ? (function (C) {
                  var F = function (a, b, c) {
                    if (this instanceof C) {
                      switch (arguments.length) {
                        case 0: return new C();
                        case 1: return new C(a);
                        case 2: return new C(a, b);
                      } return new C(a, b, c);
                    } return C.apply(this, arguments);
                  };
                  F[PROTOTYPE] = C[PROTOTYPE];
                  return F;
                // make static versions for prototype methods
                })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
                // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
                if (IS_PROTO) {
                  (exports.virtual || (exports.virtual = {}))[key] = out;
                  // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
                  if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
                }
              }
            };
            // type bitmap
            $export.F = 1;   // forced
            $export.G = 2;   // global
            $export.S = 4;   // static
            $export.P = 8;   // proto
            $export.B = 16;  // bind
            $export.W = 32;  // wrap
            $export.U = 64;  // safe
            $export.R = 128; // real proto method for `library`
            var _export = $export;

            var toString = {}.toString;

            var _cof = function (it) {
              return toString.call(it).slice(8, -1);
            };

            // fallback for non-array-like ES3 and non-enumerable old V8 strings

            // eslint-disable-next-line no-prototype-builtins
            var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
              return _cof(it) == 'String' ? it.split('') : Object(it);
            };

            // 7.2.1 RequireObjectCoercible(argument)
            var _defined = function (it) {
              if (it == undefined) throw TypeError("Can't call method on  " + it);
              return it;
            };

            // to indexed object, toObject with fallback for non-array-like ES3 strings


            var _toIobject = function (it) {
              return _iobject(_defined(it));
            };

            // 7.1.4 ToInteger
            var ceil = Math.ceil;
            var floor = Math.floor;
            var _toInteger = function (it) {
              return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
            };

            // 7.1.15 ToLength

            var min = Math.min;
            var _toLength = function (it) {
              return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
            };

            var max = Math.max;
            var min$1 = Math.min;
            var _toAbsoluteIndex = function (index, length) {
              index = _toInteger(index);
              return index < 0 ? max(index + length, 0) : min$1(index, length);
            };

            // false -> Array#indexOf
            // true  -> Array#includes



            var _arrayIncludes = function (IS_INCLUDES) {
              return function ($this, el, fromIndex) {
                var O = _toIobject($this);
                var length = _toLength(O.length);
                var index = _toAbsoluteIndex(fromIndex, length);
                var value;
                // Array#includes uses SameValueZero equality algorithm
                // eslint-disable-next-line no-self-compare
                if (IS_INCLUDES && el != el) while (length > index) {
                  value = O[index++];
                  // eslint-disable-next-line no-self-compare
                  if (value != value) return true;
                // Array#indexOf ignores holes, Array#includes - not
                } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
                  if (O[index] === el) return IS_INCLUDES || index || 0;
                } return !IS_INCLUDES && -1;
              };
            };

            var _library = true;

            var _shared = createCommonjsModule(function (module) {
            var SHARED = '__core-js_shared__';
            var store = _global[SHARED] || (_global[SHARED] = {});

            (module.exports = function (key, value) {
              return store[key] || (store[key] = value !== undefined ? value : {});
            })('versions', []).push({
              version: _core.version,
              mode:  'pure' ,
              copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
            });
            });

            var id = 0;
            var px = Math.random();
            var _uid = function (key) {
              return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
            };

            var shared = _shared('keys');

            var _sharedKey = function (key) {
              return shared[key] || (shared[key] = _uid(key));
            };

            var arrayIndexOf = _arrayIncludes(false);
            var IE_PROTO = _sharedKey('IE_PROTO');

            var _objectKeysInternal = function (object, names) {
              var O = _toIobject(object);
              var i = 0;
              var result = [];
              var key;
              for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
              // Don't enum bug & hidden keys
              while (names.length > i) if (_has(O, key = names[i++])) {
                ~arrayIndexOf(result, key) || result.push(key);
              }
              return result;
            };

            // IE 8- don't enum bug keys
            var _enumBugKeys = (
              'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
            ).split(',');

            // 19.1.2.14 / 15.2.3.14 Object.keys(O)



            var _objectKeys = Object.keys || function keys(O) {
              return _objectKeysInternal(O, _enumBugKeys);
            };

            var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
              _anObject(O);
              var keys = _objectKeys(Properties);
              var length = keys.length;
              var i = 0;
              var P;
              while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
              return O;
            };

            var document$2 = _global.document;
            var _html = document$2 && document$2.documentElement;

            // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



            var IE_PROTO$1 = _sharedKey('IE_PROTO');
            var Empty = function () { /* empty */ };
            var PROTOTYPE$1 = 'prototype';

            // Create object with fake `null` prototype: use iframe Object with cleared prototype
            var createDict = function () {
              // Thrash, waste and sodomy: IE GC bug
              var iframe = _domCreate('iframe');
              var i = _enumBugKeys.length;
              var lt = '<';
              var gt = '>';
              var iframeDocument;
              iframe.style.display = 'none';
              _html.appendChild(iframe);
              iframe.src = 'javascript:'; // eslint-disable-line no-script-url
              // createDict = iframe.contentWindow.Object;
              // html.removeChild(iframe);
              iframeDocument = iframe.contentWindow.document;
              iframeDocument.open();
              iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
              iframeDocument.close();
              createDict = iframeDocument.F;
              while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
              return createDict();
            };

            var _objectCreate = Object.create || function create(O, Properties) {
              var result;
              if (O !== null) {
                Empty[PROTOTYPE$1] = _anObject(O);
                result = new Empty();
                Empty[PROTOTYPE$1] = null;
                // add "__proto__" for Object.getPrototypeOf polyfill
                result[IE_PROTO$1] = O;
              } else result = createDict();
              return Properties === undefined ? result : _objectDps(result, Properties);
            };

            // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
            _export(_export.S, 'Object', { create: _objectCreate });

            var $Object = _core.Object;
            var create = function create(P, D) {
              return $Object.create(P, D);
            };

            var create$1 = createCommonjsModule(function (module) {
            module.exports = { "default": create, __esModule: true };
            });

            var _Object$create = unwrapExports(create$1);

            var f$1 = {}.propertyIsEnumerable;

            var _objectPie = {
            	f: f$1
            };

            var gOPD = Object.getOwnPropertyDescriptor;

            var f$2 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
              O = _toIobject(O);
              P = _toPrimitive(P, true);
              if (_ie8DomDefine) try {
                return gOPD(O, P);
              } catch (e) { /* empty */ }
              if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
            };

            var _objectGopd = {
            	f: f$2
            };

            // Works with __proto__ only. Old v8 can't work with null proto objects.
            /* eslint-disable no-proto */


            var check = function (O, proto) {
              _anObject(O);
              if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
            };
            var _setProto = {
              set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
                function (test, buggy, set) {
                  try {
                    set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
                    set(test, []);
                    buggy = !(test instanceof Array);
                  } catch (e) { buggy = true; }
                  return function setPrototypeOf(O, proto) {
                    check(O, proto);
                    if (buggy) O.__proto__ = proto;
                    else set(O, proto);
                    return O;
                  };
                }({}, false) : undefined),
              check: check
            };

            // 19.1.3.19 Object.setPrototypeOf(O, proto)

            _export(_export.S, 'Object', { setPrototypeOf: _setProto.set });

            var setPrototypeOf = _core.Object.setPrototypeOf;

            var setPrototypeOf$1 = createCommonjsModule(function (module) {
            module.exports = { "default": setPrototypeOf, __esModule: true };
            });

            var _Object$setPrototypeOf = unwrapExports(setPrototypeOf$1);

            // true  -> String#at
            // false -> String#codePointAt
            var _stringAt = function (TO_STRING) {
              return function (that, pos) {
                var s = String(_defined(that));
                var i = _toInteger(pos);
                var l = s.length;
                var a, b;
                if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
                a = s.charCodeAt(i);
                return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
                  ? TO_STRING ? s.charAt(i) : a
                  : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
              };
            };

            var _redefine = _hide;

            var _iterators = {};

            var _wks = createCommonjsModule(function (module) {
            var store = _shared('wks');

            var Symbol = _global.Symbol;
            var USE_SYMBOL = typeof Symbol == 'function';

            var $exports = module.exports = function (name) {
              return store[name] || (store[name] =
                USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
            };

            $exports.store = store;
            });

            var def = _objectDp.f;

            var TAG = _wks('toStringTag');

            var _setToStringTag = function (it, tag, stat) {
              if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
            };

            var IteratorPrototype = {};

            // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
            _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

            var _iterCreate = function (Constructor, NAME, next) {
              Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
              _setToStringTag(Constructor, NAME + ' Iterator');
            };

            // 7.1.13 ToObject(argument)

            var _toObject = function (it) {
              return Object(_defined(it));
            };

            // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


            var IE_PROTO$2 = _sharedKey('IE_PROTO');
            var ObjectProto = Object.prototype;

            var _objectGpo = Object.getPrototypeOf || function (O) {
              O = _toObject(O);
              if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
              if (typeof O.constructor == 'function' && O instanceof O.constructor) {
                return O.constructor.prototype;
              } return O instanceof Object ? ObjectProto : null;
            };

            var ITERATOR = _wks('iterator');
            var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
            var FF_ITERATOR = '@@iterator';
            var KEYS = 'keys';
            var VALUES = 'values';

            var returnThis = function () { return this; };

            var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
              _iterCreate(Constructor, NAME, next);
              var getMethod = function (kind) {
                if (!BUGGY && kind in proto) return proto[kind];
                switch (kind) {
                  case KEYS: return function keys() { return new Constructor(this, kind); };
                  case VALUES: return function values() { return new Constructor(this, kind); };
                } return function entries() { return new Constructor(this, kind); };
              };
              var TAG = NAME + ' Iterator';
              var DEF_VALUES = DEFAULT == VALUES;
              var VALUES_BUG = false;
              var proto = Base.prototype;
              var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
              var $default = $native || getMethod(DEFAULT);
              var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
              var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
              var methods, key, IteratorPrototype;
              // Fix native
              if ($anyNative) {
                IteratorPrototype = _objectGpo($anyNative.call(new Base()));
                if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
                  // Set @@toStringTag to native iterators
                  _setToStringTag(IteratorPrototype, TAG, true);
                }
              }
              // fix Array#{values, @@iterator}.name in V8 / FF
              if (DEF_VALUES && $native && $native.name !== VALUES) {
                VALUES_BUG = true;
                $default = function values() { return $native.call(this); };
              }
              // Define iterator
              if (( FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
                _hide(proto, ITERATOR, $default);
              }
              // Plug for library
              _iterators[NAME] = $default;
              _iterators[TAG] = returnThis;
              if (DEFAULT) {
                methods = {
                  values: DEF_VALUES ? $default : getMethod(VALUES),
                  keys: IS_SET ? $default : getMethod(KEYS),
                  entries: $entries
                };
                if (FORCED) for (key in methods) {
                  if (!(key in proto)) _redefine(proto, key, methods[key]);
                } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
              }
              return methods;
            };

            var $at = _stringAt(true);

            // 21.1.3.27 String.prototype[@@iterator]()
            _iterDefine(String, 'String', function (iterated) {
              this._t = String(iterated); // target
              this._i = 0;                // next index
            // 21.1.5.2.1 %StringIteratorPrototype%.next()
            }, function () {
              var O = this._t;
              var index = this._i;
              var point;
              if (index >= O.length) return { value: undefined, done: true };
              point = $at(O, index);
              this._i += point.length;
              return { value: point, done: false };
            });

            var _iterStep = function (done, value) {
              return { value: value, done: !!done };
            };

            // 22.1.3.4 Array.prototype.entries()
            // 22.1.3.13 Array.prototype.keys()
            // 22.1.3.29 Array.prototype.values()
            // 22.1.3.30 Array.prototype[@@iterator]()
            var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
              this._t = _toIobject(iterated); // target
              this._i = 0;                   // next index
              this._k = kind;                // kind
            // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
            }, function () {
              var O = this._t;
              var kind = this._k;
              var index = this._i++;
              if (!O || index >= O.length) {
                this._t = undefined;
                return _iterStep(1);
              }
              if (kind == 'keys') return _iterStep(0, index);
              if (kind == 'values') return _iterStep(0, O[index]);
              return _iterStep(0, [index, O[index]]);
            }, 'values');

            // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
            _iterators.Arguments = _iterators.Array;

            var TO_STRING_TAG = _wks('toStringTag');

            var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
              'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
              'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
              'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
              'TextTrackList,TouchList').split(',');

            for (var i = 0; i < DOMIterables.length; i++) {
              var NAME = DOMIterables[i];
              var Collection = _global[NAME];
              var proto = Collection && Collection.prototype;
              if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
              _iterators[NAME] = _iterators.Array;
            }

            var f$3 = _wks;

            var _wksExt = {
            	f: f$3
            };

            var iterator = _wksExt.f('iterator');

            var iterator$1 = createCommonjsModule(function (module) {
            module.exports = { "default": iterator, __esModule: true };
            });

            unwrapExports(iterator$1);

            var _meta = createCommonjsModule(function (module) {
            var META = _uid('meta');


            var setDesc = _objectDp.f;
            var id = 0;
            var isExtensible = Object.isExtensible || function () {
              return true;
            };
            var FREEZE = !_fails(function () {
              return isExtensible(Object.preventExtensions({}));
            });
            var setMeta = function (it) {
              setDesc(it, META, { value: {
                i: 'O' + ++id, // object ID
                w: {}          // weak collections IDs
              } });
            };
            var fastKey = function (it, create) {
              // return primitive with prefix
              if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
              if (!_has(it, META)) {
                // can't set metadata to uncaught frozen object
                if (!isExtensible(it)) return 'F';
                // not necessary to add metadata
                if (!create) return 'E';
                // add missing metadata
                setMeta(it);
              // return object ID
              } return it[META].i;
            };
            var getWeak = function (it, create) {
              if (!_has(it, META)) {
                // can't set metadata to uncaught frozen object
                if (!isExtensible(it)) return true;
                // not necessary to add metadata
                if (!create) return false;
                // add missing metadata
                setMeta(it);
              // return hash weak collections IDs
              } return it[META].w;
            };
            // add metadata on freeze-family methods calling
            var onFreeze = function (it) {
              if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
              return it;
            };
            var meta = module.exports = {
              KEY: META,
              NEED: false,
              fastKey: fastKey,
              getWeak: getWeak,
              onFreeze: onFreeze
            };
            });
            var _meta_1 = _meta.KEY;
            var _meta_2 = _meta.NEED;
            var _meta_3 = _meta.fastKey;
            var _meta_4 = _meta.getWeak;
            var _meta_5 = _meta.onFreeze;

            var defineProperty = _objectDp.f;
            var _wksDefine = function (name) {
              var $Symbol = _core.Symbol || (_core.Symbol =  {} );
              if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
            };

            var f$4 = Object.getOwnPropertySymbols;

            var _objectGops = {
            	f: f$4
            };

            // all enumerable object keys, includes symbols



            var _enumKeys = function (it) {
              var result = _objectKeys(it);
              var getSymbols = _objectGops.f;
              if (getSymbols) {
                var symbols = getSymbols(it);
                var isEnum = _objectPie.f;
                var i = 0;
                var key;
                while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
              } return result;
            };

            // 7.2.2 IsArray(argument)

            var _isArray = Array.isArray || function isArray(arg) {
              return _cof(arg) == 'Array';
            };

            // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

            var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

            var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
              return _objectKeysInternal(O, hiddenKeys);
            };

            var _objectGopn = {
            	f: f$5
            };

            // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

            var gOPN = _objectGopn.f;
            var toString$1 = {}.toString;

            var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
              ? Object.getOwnPropertyNames(window) : [];

            var getWindowNames = function (it) {
              try {
                return gOPN(it);
              } catch (e) {
                return windowNames.slice();
              }
            };

            var f$6 = function getOwnPropertyNames(it) {
              return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
            };

            var _objectGopnExt = {
            	f: f$6
            };

            // ECMAScript 6 symbols shim





            var META = _meta.KEY;





















            var gOPD$1 = _objectGopd.f;
            var dP$1 = _objectDp.f;
            var gOPN$1 = _objectGopnExt.f;
            var $Symbol = _global.Symbol;
            var $JSON = _global.JSON;
            var _stringify = $JSON && $JSON.stringify;
            var PROTOTYPE$2 = 'prototype';
            var HIDDEN = _wks('_hidden');
            var TO_PRIMITIVE = _wks('toPrimitive');
            var isEnum = {}.propertyIsEnumerable;
            var SymbolRegistry = _shared('symbol-registry');
            var AllSymbols = _shared('symbols');
            var OPSymbols = _shared('op-symbols');
            var ObjectProto$1 = Object[PROTOTYPE$2];
            var USE_NATIVE = typeof $Symbol == 'function' && !!_objectGops.f;
            var QObject = _global.QObject;
            // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
            var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

            // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
            var setSymbolDesc = _descriptors && _fails(function () {
              return _objectCreate(dP$1({}, 'a', {
                get: function () { return dP$1(this, 'a', { value: 7 }).a; }
              })).a != 7;
            }) ? function (it, key, D) {
              var protoDesc = gOPD$1(ObjectProto$1, key);
              if (protoDesc) delete ObjectProto$1[key];
              dP$1(it, key, D);
              if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
            } : dP$1;

            var wrap = function (tag) {
              var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
              sym._k = tag;
              return sym;
            };

            var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
              return typeof it == 'symbol';
            } : function (it) {
              return it instanceof $Symbol;
            };

            var $defineProperty = function defineProperty(it, key, D) {
              if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
              _anObject(it);
              key = _toPrimitive(key, true);
              _anObject(D);
              if (_has(AllSymbols, key)) {
                if (!D.enumerable) {
                  if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
                  it[HIDDEN][key] = true;
                } else {
                  if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
                  D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
                } return setSymbolDesc(it, key, D);
              } return dP$1(it, key, D);
            };
            var $defineProperties = function defineProperties(it, P) {
              _anObject(it);
              var keys = _enumKeys(P = _toIobject(P));
              var i = 0;
              var l = keys.length;
              var key;
              while (l > i) $defineProperty(it, key = keys[i++], P[key]);
              return it;
            };
            var $create = function create(it, P) {
              return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
            };
            var $propertyIsEnumerable = function propertyIsEnumerable(key) {
              var E = isEnum.call(this, key = _toPrimitive(key, true));
              if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
              return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
            };
            var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
              it = _toIobject(it);
              key = _toPrimitive(key, true);
              if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
              var D = gOPD$1(it, key);
              if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
              return D;
            };
            var $getOwnPropertyNames = function getOwnPropertyNames(it) {
              var names = gOPN$1(_toIobject(it));
              var result = [];
              var i = 0;
              var key;
              while (names.length > i) {
                if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
              } return result;
            };
            var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
              var IS_OP = it === ObjectProto$1;
              var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
              var result = [];
              var i = 0;
              var key;
              while (names.length > i) {
                if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
              } return result;
            };

            // 19.4.1.1 Symbol([description])
            if (!USE_NATIVE) {
              $Symbol = function Symbol() {
                if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
                var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
                var $set = function (value) {
                  if (this === ObjectProto$1) $set.call(OPSymbols, value);
                  if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                  setSymbolDesc(this, tag, _propertyDesc(1, value));
                };
                if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
                return wrap(tag);
              };
              _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
                return this._k;
              });

              _objectGopd.f = $getOwnPropertyDescriptor;
              _objectDp.f = $defineProperty;
              _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
              _objectPie.f = $propertyIsEnumerable;
              _objectGops.f = $getOwnPropertySymbols;

              if (_descriptors && !_library) {
                _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
              }

              _wksExt.f = function (name) {
                return wrap(_wks(name));
              };
            }

            _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

            for (var es6Symbols = (
              // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
              'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
            ).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

            for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

            _export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
              // 19.4.2.1 Symbol.for(key)
              'for': function (key) {
                return _has(SymbolRegistry, key += '')
                  ? SymbolRegistry[key]
                  : SymbolRegistry[key] = $Symbol(key);
              },
              // 19.4.2.5 Symbol.keyFor(sym)
              keyFor: function keyFor(sym) {
                if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
                for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
              },
              useSetter: function () { setter = true; },
              useSimple: function () { setter = false; }
            });

            _export(_export.S + _export.F * !USE_NATIVE, 'Object', {
              // 19.1.2.2 Object.create(O [, Properties])
              create: $create,
              // 19.1.2.4 Object.defineProperty(O, P, Attributes)
              defineProperty: $defineProperty,
              // 19.1.2.3 Object.defineProperties(O, Properties)
              defineProperties: $defineProperties,
              // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
              getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
              // 19.1.2.7 Object.getOwnPropertyNames(O)
              getOwnPropertyNames: $getOwnPropertyNames,
              // 19.1.2.8 Object.getOwnPropertySymbols(O)
              getOwnPropertySymbols: $getOwnPropertySymbols
            });

            // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
            // https://bugs.chromium.org/p/v8/issues/detail?id=3443
            var FAILS_ON_PRIMITIVES = _fails(function () { _objectGops.f(1); });

            _export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
              getOwnPropertySymbols: function getOwnPropertySymbols(it) {
                return _objectGops.f(_toObject(it));
              }
            });

            // 24.3.2 JSON.stringify(value [, replacer [, space]])
            $JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
              var S = $Symbol();
              // MS Edge converts symbol values to JSON as {}
              // WebKit converts symbol values to JSON as null
              // V8 throws on boxed symbols
              return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
            })), 'JSON', {
              stringify: function stringify(it) {
                var args = [it];
                var i = 1;
                var replacer, $replacer;
                while (arguments.length > i) args.push(arguments[i++]);
                $replacer = replacer = args[1];
                if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
                if (!_isArray(replacer)) replacer = function (key, value) {
                  if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
                  if (!isSymbol(value)) return value;
                };
                args[1] = replacer;
                return _stringify.apply($JSON, args);
              }
            });

            // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
            $Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
            // 19.4.3.5 Symbol.prototype[@@toStringTag]
            _setToStringTag($Symbol, 'Symbol');
            // 20.2.1.9 Math[@@toStringTag]
            _setToStringTag(Math, 'Math', true);
            // 24.3.3 JSON[@@toStringTag]
            _setToStringTag(_global.JSON, 'JSON', true);

            _wksDefine('asyncIterator');

            _wksDefine('observable');

            var symbol = _core.Symbol;

            var symbol$1 = createCommonjsModule(function (module) {
            module.exports = { "default": symbol, __esModule: true };
            });

            var _Symbol = unwrapExports(symbol$1);

            var _typeof_1 = createCommonjsModule(function (module, exports) {

            exports.__esModule = true;



            var _iterator2 = _interopRequireDefault(iterator$1);



            var _symbol2 = _interopRequireDefault(symbol$1);

            var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
              return typeof obj === "undefined" ? "undefined" : _typeof(obj);
            } : function (obj) {
              return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
            };
            });

            var _typeof = unwrapExports(_typeof_1);

            // most Object methods by ES6 should accept primitives



            var _objectSap = function (KEY, exec) {
              var fn = (_core.Object || {})[KEY] || Object[KEY];
              var exp = {};
              exp[KEY] = exec(fn);
              _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
            };

            // 19.1.2.14 Object.keys(O)



            _objectSap('keys', function () {
              return function keys(it) {
                return _objectKeys(_toObject(it));
              };
            });

            var keys = _core.Object.keys;

            var keys$1 = createCommonjsModule(function (module) {
            module.exports = { "default": keys, __esModule: true };
            });

            var _Object$keys = unwrapExports(keys$1);

            var NOW;
            // Include a performance.now polyfill.
            // In node.js, use process.hrtime.
            // eslint-disable-next-line
            // @ts-ignore
            if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
                NOW = function NOW() {
                    // eslint-disable-next-line
                    // @ts-ignore
                    var time = process.hrtime();
                    // Convert [seconds, nanoseconds] to milliseconds.
                    return time[0] * 1000 + time[1] / 1000000;
                };
            }
            // In a browser, use self.performance.now if it is available.
            else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
                    // This must be bound, because directly assigning this function
                    // leads to an invocation exception in Chrome.
                    NOW = self.performance.now.bind(self.performance);
                }
                // Use Date.now if it is available.
                else if (Date.now !== undefined) {
                        NOW = Date.now;
                    }
                    // Otherwise, use 'new Date().getTime()'.
                    else {
                            NOW = function NOW() {
                                return new Date().getTime();
                            };
                        }
            var NOW$1 = NOW;

            /**
             * Controlling groups of tweens
             *
             * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
             * In these cases, you may want to create your own smaller groups of tween
             */
            var Group = /** @class */function () {
                function Group() {
                    this._tweens = {};
                    this._tweensAddedDuringUpdate = {};
                }
                Group.prototype.getAll = function () {
                    var _this = this;
                    return _Object$keys(this._tweens).map(function (tweenId) {
                        return _this._tweens[tweenId];
                    });
                };
                Group.prototype.removeAll = function () {
                    this._tweens = {};
                };
                Group.prototype.add = function (tween) {
                    this._tweens[tween.getId()] = tween;
                    this._tweensAddedDuringUpdate[tween.getId()] = tween;
                };
                Group.prototype.remove = function (tween) {
                    delete this._tweens[tween.getId()];
                    delete this._tweensAddedDuringUpdate[tween.getId()];
                };
                Group.prototype.update = function (time, preserve) {
                    var tweenIds = _Object$keys(this._tweens);
                    if (tweenIds.length === 0) {
                        return false;
                    }
                    time = time !== undefined ? time : NOW$1();
                    // Tweens are updated in "batches". If you add a new tween during an
                    // update, then the new tween will be updated in the next batch.
                    // If you remove a tween during an update, it may or may not be updated.
                    // However, if the removed tween was added during the current batch,
                    // then it will not be updated.
                    while (tweenIds.length > 0) {
                        this._tweensAddedDuringUpdate = {};
                        for (var i = 0; i < tweenIds.length; i++) {
                            var tween = this._tweens[tweenIds[i]];
                            if (tween && tween.update(time) === false && !preserve) {
                                delete this._tweens[tweenIds[i]];
                            }
                        }
                        tweenIds = _Object$keys(this._tweensAddedDuringUpdate);
                    }
                    return true;
                };
                return Group;
            }();

            /**
             * The Ease class provides a collection of easing functions for use with tween.js.
             */
            var Easing = {
                Linear: {
                    None: function None(amount) {
                        return amount;
                    }
                },
                Quadratic: {
                    In: function In(amount) {
                        return amount * amount;
                    },
                    Out: function Out(amount) {
                        return amount * (2 - amount);
                    },
                    InOut: function InOut(amount) {
                        if ((amount *= 2) < 1) {
                            return 0.5 * amount * amount;
                        }
                        return -0.5 * (--amount * (amount - 2) - 1);
                    }
                },
                Cubic: {
                    In: function In(amount) {
                        return amount * amount * amount;
                    },
                    Out: function Out(amount) {
                        return --amount * amount * amount + 1;
                    },
                    InOut: function InOut(amount) {
                        if ((amount *= 2) < 1) {
                            return 0.5 * amount * amount * amount;
                        }
                        return 0.5 * ((amount -= 2) * amount * amount + 2);
                    }
                },
                Quartic: {
                    In: function In(amount) {
                        return amount * amount * amount * amount;
                    },
                    Out: function Out(amount) {
                        return 1 - --amount * amount * amount * amount;
                    },
                    InOut: function InOut(amount) {
                        if ((amount *= 2) < 1) {
                            return 0.5 * amount * amount * amount * amount;
                        }
                        return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
                    }
                },
                Quintic: {
                    In: function In(amount) {
                        return amount * amount * amount * amount * amount;
                    },
                    Out: function Out(amount) {
                        return --amount * amount * amount * amount * amount + 1;
                    },
                    InOut: function InOut(amount) {
                        if ((amount *= 2) < 1) {
                            return 0.5 * amount * amount * amount * amount * amount;
                        }
                        return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
                    }
                },
                Sinusoidal: {
                    In: function In(amount) {
                        return 1 - Math.cos(amount * Math.PI / 2);
                    },
                    Out: function Out(amount) {
                        return Math.sin(amount * Math.PI / 2);
                    },
                    InOut: function InOut(amount) {
                        return 0.5 * (1 - Math.cos(Math.PI * amount));
                    }
                },
                Exponential: {
                    In: function In(amount) {
                        return amount === 0 ? 0 : Math.pow(1024, amount - 1);
                    },
                    Out: function Out(amount) {
                        return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
                    },
                    InOut: function InOut(amount) {
                        if (amount === 0) {
                            return 0;
                        }
                        if (amount === 1) {
                            return 1;
                        }
                        if ((amount *= 2) < 1) {
                            return 0.5 * Math.pow(1024, amount - 1);
                        }
                        return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
                    }
                },
                Circular: {
                    In: function In(amount) {
                        return 1 - Math.sqrt(1 - amount * amount);
                    },
                    Out: function Out(amount) {
                        return Math.sqrt(1 - --amount * amount);
                    },
                    InOut: function InOut(amount) {
                        if ((amount *= 2) < 1) {
                            return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
                        }
                        return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
                    }
                },
                Elastic: {
                    In: function In(amount) {
                        if (amount === 0) {
                            return 0;
                        }
                        if (amount === 1) {
                            return 1;
                        }
                        return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
                    },
                    Out: function Out(amount) {
                        if (amount === 0) {
                            return 0;
                        }
                        if (amount === 1) {
                            return 1;
                        }
                        return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
                    },
                    InOut: function InOut(amount) {
                        if (amount === 0) {
                            return 0;
                        }
                        if (amount === 1) {
                            return 1;
                        }
                        amount *= 2;
                        if (amount < 1) {
                            return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
                        }
                        return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
                    }
                },
                Back: {
                    In: function In(amount) {
                        var s = 1.70158;
                        return amount * amount * ((s + 1) * amount - s);
                    },
                    Out: function Out(amount) {
                        var s = 1.70158;
                        return --amount * amount * ((s + 1) * amount + s) + 1;
                    },
                    InOut: function InOut(amount) {
                        var s = 1.70158 * 1.525;
                        if ((amount *= 2) < 1) {
                            return 0.5 * (amount * amount * ((s + 1) * amount - s));
                        }
                        return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
                    }
                },
                Bounce: {
                    In: function In(amount) {
                        return 1 - Easing.Bounce.Out(1 - amount);
                    },
                    Out: function Out(amount) {
                        if (amount < 1 / 2.75) {
                            return 7.5625 * amount * amount;
                        } else if (amount < 2 / 2.75) {
                            return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
                        } else if (amount < 2.5 / 2.75) {
                            return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
                        } else {
                            return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
                        }
                    },
                    InOut: function InOut(amount) {
                        if (amount < 0.5) {
                            return Easing.Bounce.In(amount * 2) * 0.5;
                        }
                        return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
                    }
                }
            };

            /**
             *
             */
            var Interpolation = {
                Linear: function Linear(v, k) {
                    var m = v.length - 1;
                    var f = m * k;
                    var i = Math.floor(f);
                    var fn = Interpolation.Utils.Linear;
                    if (k < 0) {
                        return fn(v[0], v[1], f);
                    }
                    if (k > 1) {
                        return fn(v[m], v[m - 1], m - f);
                    }
                    return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
                },
                Bezier: function Bezier(v, k) {
                    var b = 0;
                    var n = v.length - 1;
                    var pw = Math.pow;
                    var bn = Interpolation.Utils.Bernstein;
                    for (var i = 0; i <= n; i++) {
                        b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
                    }
                    return b;
                },
                CatmullRom: function CatmullRom(v, k) {
                    var m = v.length - 1;
                    var f = m * k;
                    var i = Math.floor(f);
                    var fn = Interpolation.Utils.CatmullRom;
                    if (v[0] === v[m]) {
                        if (k < 0) {
                            i = Math.floor(f = m * (1 + k));
                        }
                        return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
                    } else {
                        if (k < 0) {
                            return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
                        }
                        if (k > 1) {
                            return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
                        }
                        return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
                    }
                },
                Utils: {
                    Linear: function Linear(p0, p1, t) {
                        return (p1 - p0) * t + p0;
                    },
                    Bernstein: function Bernstein(n, i) {
                        var fc = Interpolation.Utils.Factorial;
                        return fc(n) / fc(i) / fc(n - i);
                    },
                    Factorial: function () {
                        var a = [1];
                        return function (n) {
                            var s = 1;
                            if (a[n]) {
                                return a[n];
                            }
                            for (var i = n; i > 1; i--) {
                                s *= i;
                            }
                            a[n] = s;
                            return s;
                        };
                    }(),
                    CatmullRom: function CatmullRom(p0, p1, p2, p3, t) {
                        var v0 = (p2 - p0) * 0.5;
                        var v1 = (p3 - p1) * 0.5;
                        var t2 = t * t;
                        var t3 = t * t2;
                        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
                    }
                }
            };

            /**
             * Utils
             */
            var Sequence = /** @class */function () {
                function Sequence() {}
                Sequence.nextId = function () {
                    return Sequence._nextId++;
                };
                Sequence._nextId = 0;
                return Sequence;
            }();

            /**
             * Tween.js - Licensed under the MIT license
             * https://github.com/tweenjs/tween.js
             * ----------------------------------------------
             *
             * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
             * Thank you all, you're awesome!
             */
            var Tween = /** @class */function () {
                function Tween(_object, _group) {
                    if (_group === void 0) {
                        _group = TWEEN;
                    }
                    this._object = _object;
                    this._group = _group;
                    this._isPaused = false;
                    this._pauseStart = 0;
                    this._valuesStart = {};
                    this._valuesEnd = {};
                    this._valuesStartRepeat = {};
                    this._duration = 1000;
                    this._initialRepeat = 0;
                    this._repeat = 0;
                    this._yoyo = false;
                    this._isPlaying = false;
                    this._reversed = false;
                    this._back = false;
                    this._delayTime = 0;
                    this._startTime = 0;
                    this._easingFunction = TWEEN.Easing.Linear.None;
                    this._interpolationFunction = TWEEN.Interpolation.Linear;
                    this._chainedTweens = [];
                    this._onStartCallbackFired = false;
                    this._id = TWEEN.nextId();
                    this._isChainStopped = false;
                }
                Tween.prototype.playback = function (_playback) {
                    this._playback = _playback;
                };
                Tween.prototype.getId = function () {
                    return this._id;
                };
                Tween.prototype.isPlaying = function () {
                    return this._isPlaying;
                };
                Tween.prototype.isPaused = function () {
                    return this._isPaused;
                };
                Tween.prototype.to = function (properties, duration) {
                    for (var prop in properties) {
                        this._valuesEnd[prop] = properties[prop];
                    }
                    if (duration !== undefined) {
                        this._duration = duration;
                    }
                    return this;
                };
                Tween.prototype.duration = function (d) {
                    this._duration = d;
                    return this;
                };
                Tween.prototype.start = function (time) {
                    if (this._isPlaying) {
                        return this;
                    }
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._group.add(this);
                    this._repeat = this._initialRepeat;
                    if (this._reversed) {
                        // If we were reversed (f.e. using the yoyo feature) then we need to
                        // flip the tween direction back to forward.
                        this._reversed = false;
                        for (var property in this._valuesStartRepeat) {
                            this._swapEndStartRepeatValues(property);
                            this._valuesStart[property] = this._valuesStartRepeat[property];
                        }
                    }
                    this._isPlaying = true;
                    this._isPaused = false;
                    this._onStartCallbackFired = false;
                    this._isChainStopped = false;
                    this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
                    this._startTime += this._delayTime;
                    this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
                    return this;
                };
                Tween.prototype._setupProperties = function (_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
                    for (var property in _valuesEnd) {
                        var startValue = _object[property];
                        var startValueIsArray = Array.isArray(startValue);
                        var propType = startValueIsArray ? 'array' : typeof startValue === 'undefined' ? 'undefined' : _typeof(startValue);
                        var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
                        // If `to()` specifies a property that doesn't exist in the source object,
                        // we should not set that property in the object
                        if (propType === 'undefined' || propType === 'function') {
                            continue;
                        }
                        // Check if an Array was provided as property value
                        if (isInterpolationList) {
                            var endValues = _valuesEnd[property];
                            if (endValues.length === 0) {
                                continue;
                            }
                            // handle an array of relative values
                            endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
                            // Create a local copy of the Array with the start value at the front
                            _valuesEnd[property] = [startValue].concat(endValues);
                        }
                        // handle the deepness of the values
                        if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                            _valuesStart[property] = startValueIsArray ? [] : {};
                            // eslint-disable-next-line
                            for (var prop in startValue) {
                                // eslint-disable-next-line
                                // @ts-ignore FIXME?
                                _valuesStart[property][prop] = startValue[prop];
                            }
                            _valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
                        } else {
                            // Save the starting value, but only once.
                            if (typeof _valuesStart[property] === 'undefined') {
                                _valuesStart[property] = startValue;
                            }
                            if (!startValueIsArray) {
                                // eslint-disable-next-line
                                // @ts-ignore FIXME?
                                _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                            }
                            if (isInterpolationList) {
                                // eslint-disable-next-line
                                // @ts-ignore FIXME?
                                _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
                            } else {
                                _valuesStartRepeat[property] = _valuesStart[property] || 0;
                            }
                        }
                    }
                };
                Tween.prototype.stop = function () {
                    if (!this._isChainStopped) {
                        this._isChainStopped = true;
                        this.stopChainedTweens();
                    }
                    if (!this._isPlaying) {
                        return this;
                    }
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._group.remove(this);
                    this._isPlaying = false;
                    this._isPaused = false;
                    if (this._onStopCallback) {
                        this._onStopCallback(this._object);
                    }
                    if (this._onFinishCallback) {
                        this._onFinishCallback(this._object, 'stop');
                    }
                    return this;
                };
                Tween.prototype.end = function () {
                    this.update(Infinity);
                    return this;
                };
                Tween.prototype.pause = function (time) {
                    if (this._isPaused || !this._isPlaying) {
                        return this;
                    }
                    this._isPaused = true;
                    this._pauseStart = time === undefined ? TWEEN.now() : time;
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._group.remove(this);
                    if (this._onPauseCallback) {
                        this._onPauseCallback();
                    }
                    return this;
                };
                Tween.prototype.resume = function (time) {
                    if (!this._isPaused || !this._isPlaying) {
                        return this;
                    }
                    this._isPaused = false;
                    this._startTime += (time === undefined ? TWEEN.now() : time) - this._pauseStart;
                    this._pauseStart = 0;
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._group.add(this);
                    if (this._onResumeCallback) {
                        this._onResumeCallback();
                    }
                    return this;
                };
                Tween.prototype.stopChainedTweens = function () {
                    for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                        this._chainedTweens[i].stop();
                    }
                    return this;
                };
                Tween.prototype.group = function (group) {
                    this._group = group;
                    return this;
                };
                Tween.prototype.delay = function (amount) {
                    this._delayTime = amount;
                    return this;
                };
                Tween.prototype.repeat = function (times) {
                    this._initialRepeat = times;
                    this._repeat = times;
                    return this;
                };
                Tween.prototype.repeatDelay = function (amount) {
                    this._repeatDelayTime = amount;
                    return this;
                };
                Tween.prototype.yoyo = function (yoyo) {
                    this._yoyo = yoyo;
                    return this;
                };
                Tween.prototype.easing = function (easingFunction) {
                    this._easingFunction = easingFunction;
                    return this;
                };
                Tween.prototype.interpolation = function (interpolationFunction) {
                    this._interpolationFunction = interpolationFunction;
                    return this;
                };
                Tween.prototype.chain = function () {
                    var tweens = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        tweens[_i] = arguments[_i];
                    }
                    this._chainedTweens = tweens;
                    return this;
                };
                Tween.prototype._onStart = function (callback) {
                    this._onStartCallback = callback;
                    return this;
                };
                Tween.prototype._onUpdate = function (callback) {
                    this._onUpdateCallback = callback;
                    return this;
                };
                Tween.prototype._onRepeat = function (callback) {
                    this._onRepeatCallback = callback;
                    return this;
                };
                Tween.prototype._onComplete = function (callback) {
                    this._onCompleteCallback = callback;
                    return this;
                };
                Tween.prototype._onFinish = function (callback) {
                    this._onFinishCallback = callback;
                    return this;
                };
                Tween.prototype._onStop = function (callback) {
                    this._onStopCallback = callback;
                    return this;
                };
                Tween.prototype._onPause = function (callback) {
                    this._onPauseCallback = callback;
                    return this;
                };
                Tween.prototype._onResume = function (callback) {
                    this._onResumeCallback = callback;
                    return this;
                };
                Tween.prototype.update = function (time) {
                    var property;
                    var elapsed;
                    var endTime = this._startTime + this._duration;
                    if (time > endTime && !this._isPlaying) {
                        return false;
                    }
                    // If the tween was already finished,
                    if (!this.isPlaying) {
                        this.start(time);
                    }
                    if (time < this._startTime) {
                        return true;
                    }
                    if (this._onStartCallbackFired === false) {
                        if (this._onStartCallback) {
                            this._onStartCallback(this._object);
                        }
                        this._onStartCallbackFired = true;
                    }
                    elapsed = (time - this._startTime) / this._duration;
                    elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
                    var amount = this._playback ? 1 - elapsed : elapsed;
                    var value = this._easingFunction(amount);
                    // properties transformations
                    this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
                    if (this._onUpdateCallback) {
                        this._onUpdateCallback(this._object, elapsed);
                    }
                    if (elapsed === 1) {
                        if (this._repeat > 0) {
                            if (isFinite(this._repeat)) {
                                this._repeat--;
                            }
                            // Reassign starting values, restart by making startTime = now
                            for (property in this._valuesStartRepeat) {
                                if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                                    this._valuesStartRepeat[property] =
                                    // eslint-disable-next-line
                                    // @ts-ignore FIXME?
                                    this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                                }
                                if (this._yoyo) {
                                    this._swapEndStartRepeatValues(property);
                                }
                                this._valuesStart[property] = this._valuesStartRepeat[property];
                            }
                            if (this._yoyo) {
                                this._reversed = !this._reversed;
                            }
                            if (this._repeatDelayTime !== undefined) {
                                this._startTime = time + this._repeatDelayTime;
                            } else {
                                this._startTime = time + this._delayTime;
                            }
                            if (this._onRepeatCallback) {
                                this._onRepeatCallback(this._object);
                            }
                            return true;
                        } else {

                            if (this._onCompleteCallback) {
                                this._onCompleteCallback(this._object);
                            }

                            if (this._onFinishCallback) {
                                this._onFinishCallback(this._object, 'complete');
                            }

                            for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                                // Make the chained tweens start exactly at the time they should,
                                // even if the `update()` method was called way past the duration of the tween
                                this._chainedTweens[i].start(this._startTime + this._duration);
                            }
                            this._isPlaying = false;
                            return false;
                        }
                    }
                    return true;
                };
                Tween.prototype._updateProperties = function (_object, _valuesStart, _valuesEnd, value) {
                    for (var property in _valuesEnd) {
                        // Don't update properties that do not exist in the source object
                        if (_valuesStart[property] === undefined) {
                            continue;
                        }
                        var start = _valuesStart[property] || 0;
                        var end = _valuesEnd[property];
                        var startIsArray = Array.isArray(_object[property]);
                        var endIsArray = Array.isArray(end);
                        var isInterpolationList = !startIsArray && endIsArray;
                        if (isInterpolationList) {
                            _object[property] = this._interpolationFunction(end, value);
                        } else if ((typeof end === 'undefined' ? 'undefined' : _typeof(end)) === 'object' && end) {
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            this._updateProperties(_object[property], start, end, value);
                        } else {
                            // Parses relative end values with start as base (e.g.: +10, -3)
                            end = this._handleRelativeValue(start, end);
                            // Protect against non numeric properties.
                            if (typeof end === 'number') {
                                // eslint-disable-next-line
                                // @ts-ignore FIXME?
                                _object[property] = start + (end - start) * value;
                            }
                        }
                    }
                };
                Tween.prototype._handleRelativeValue = function (start, end) {
                    if (typeof end !== 'string') {
                        return end;
                    }
                    if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                        return start + parseFloat(end);
                    } else {
                        return parseFloat(end);
                    }
                };
                Tween.prototype._swapEndStartRepeatValues = function (property) {
                    var tmp = this._valuesStartRepeat[property];
                    if (typeof this._valuesEnd[property] === 'string') {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                    } else {
                        this._valuesStartRepeat[property] = this._valuesEnd[property];
                    }
                    this._valuesEnd[property] = tmp;
                };
                return Tween;
            }();

            var VERSION = '18.6.0';

            /**
             * Tween.js - Licensed under the MIT license
             * https://github.com/tweenjs/tween.js
             * ----------------------------------------------
             *
             * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
             * Thank you all, you're awesome!
             */
            var __extends = undefined && undefined.__extends || function () {
                var _extendStatics = function extendStatics(d, b) {
                    _extendStatics = _Object$setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                        d.__proto__ = b;
                    } || function (d, b) {
                        for (var p in b) {
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                        }
                    };
                    return _extendStatics(d, b);
                };
                return function (d, b) {
                    _extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? _Object$create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            /**
             * Controlling groups of tweens
             *
             * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
             * In these cases, you may want to create your own smaller groups of tween
             */
            var Main = /** @class */function (_super) {
                __extends(Main, _super);
                function Main() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.version = VERSION;
                    _this.now = NOW$1;
                    _this.Group = Group;
                    _this.Easing = Easing;
                    _this.Interpolation = Interpolation;
                    _this.nextId = Sequence.nextId;
                    _this.Tween = Tween;
                    return _this;
                }
                return Main;
            }(Group);
            var TWEEN = new Main();

            // 19.1.2.9 Object.getPrototypeOf(O)



            _objectSap('getPrototypeOf', function () {
              return function getPrototypeOf(it) {
                return _objectGpo(_toObject(it));
              };
            });

            var getPrototypeOf = _core.Object.getPrototypeOf;

            var getPrototypeOf$1 = createCommonjsModule(function (module) {
            module.exports = { "default": getPrototypeOf, __esModule: true };
            });

            var _Object$getPrototypeOf = unwrapExports(getPrototypeOf$1);

            var classCallCheck = createCommonjsModule(function (module, exports) {

            exports.__esModule = true;

            exports.default = function (instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            };
            });

            var _classCallCheck = unwrapExports(classCallCheck);

            // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
            _export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

            var $Object$1 = _core.Object;
            var defineProperty$1 = function defineProperty(it, key, desc) {
              return $Object$1.defineProperty(it, key, desc);
            };

            var defineProperty$2 = createCommonjsModule(function (module) {
            module.exports = { "default": defineProperty$1, __esModule: true };
            });

            unwrapExports(defineProperty$2);

            var createClass = createCommonjsModule(function (module, exports) {

            exports.__esModule = true;



            var _defineProperty2 = _interopRequireDefault(defineProperty$2);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ("value" in descriptor) descriptor.writable = true;
                  (0, _defineProperty2.default)(target, descriptor.key, descriptor);
                }
              }

              return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            }();
            });

            var _createClass = unwrapExports(createClass);

            var possibleConstructorReturn = createCommonjsModule(function (module, exports) {

            exports.__esModule = true;



            var _typeof3 = _interopRequireDefault(_typeof_1);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function (self, call) {
              if (!self) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
              }

              return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
            };
            });

            var _possibleConstructorReturn = unwrapExports(possibleConstructorReturn);

            var inherits = createCommonjsModule(function (module, exports) {

            exports.__esModule = true;



            var _setPrototypeOf2 = _interopRequireDefault(setPrototypeOf$1);



            var _create2 = _interopRequireDefault(create$1);



            var _typeof3 = _interopRequireDefault(_typeof_1);

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

            exports.default = function (subClass, superClass) {
              if (typeof superClass !== "function" && superClass !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
              }

              subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true
                }
              });
              if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
            };
            });

            var _inherits = unwrapExports(inherits);

            // 19.1.2.1 Object.assign(target, source, ...)






            var $assign = Object.assign;

            // should work with symbols and should have deterministic property order (V8 bug)
            var _objectAssign = !$assign || _fails(function () {
              var A = {};
              var B = {};
              // eslint-disable-next-line no-undef
              var S = Symbol();
              var K = 'abcdefghijklmnopqrst';
              A[S] = 7;
              K.split('').forEach(function (k) { B[k] = k; });
              return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
            }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
              var T = _toObject(target);
              var aLen = arguments.length;
              var index = 1;
              var getSymbols = _objectGops.f;
              var isEnum = _objectPie.f;
              while (aLen > index) {
                var S = _iobject(arguments[index++]);
                var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
                var length = keys.length;
                var j = 0;
                var key;
                while (length > j) {
                  key = keys[j++];
                  if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
                }
              } return T;
            } : $assign;

            // 19.1.3.1 Object.assign(target, source)


            _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

            var assign = _core.Object.assign;

            var assign$1 = createCommonjsModule(function (module) {
            module.exports = { "default": assign, __esModule: true };
            });

            var _Object$assign = unwrapExports(assign$1);

            function EventDispatcher() {}

            _Object$assign(EventDispatcher.prototype, {
                addEventListener: function addEventListener(type, listener) {
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

                hasEventListener: function hasEventListener(type, listener) {
                    if (this._listeners === undefined) return false;

                    var listeners = this._listeners;
                    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
                },

                removeEventListener: function removeEventListener(type, listener) {
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

                dispatchEvent: function dispatchEvent(event) {
                    if (this._listeners === undefined) return;

                    var listeners = this._listeners;
                    var listenerArray = listeners[event.type];

                    if (listenerArray !== undefined) {
                        event.target = this;

                        var array = listenerArray.slice(0);

                        for (var i = 0, l = array.length; i < l; i++) {
                            array[i].call(this, event);
                        }
                    }
                }
            });

            var START = "start";
            var STOP = "stop";
            var FINISH = "finish";
            var COMPLETE = "complete";
            var PAUSE = "pause";
            var RESUME = "resume";

            // getting tag from 19.1.3.6 Object.prototype.toString()

            var TAG$1 = _wks('toStringTag');
            // ES3 wrong here
            var ARG = _cof(function () { return arguments; }()) == 'Arguments';

            // fallback for IE11 Script Access Denied error
            var tryGet = function (it, key) {
              try {
                return it[key];
              } catch (e) { /* empty */ }
            };

            var _classof = function (it) {
              var O, T, B;
              return it === undefined ? 'Undefined' : it === null ? 'Null'
                // @@toStringTag case
                : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
                // builtinTag case
                : ARG ? _cof(O)
                // ES3 arguments fallback
                : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
            };

            var _anInstance = function (it, Constructor, name, forbiddenField) {
              if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
                throw TypeError(name + ': incorrect invocation!');
              } return it;
            };

            // call something on iterator step with safe closing on error

            var _iterCall = function (iterator, fn, value, entries) {
              try {
                return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
              // 7.4.6 IteratorClose(iterator, completion)
              } catch (e) {
                var ret = iterator['return'];
                if (ret !== undefined) _anObject(ret.call(iterator));
                throw e;
              }
            };

            // check on default Array iterator

            var ITERATOR$1 = _wks('iterator');
            var ArrayProto = Array.prototype;

            var _isArrayIter = function (it) {
              return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
            };

            var ITERATOR$2 = _wks('iterator');

            var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
              if (it != undefined) return it[ITERATOR$2]
                || it['@@iterator']
                || _iterators[_classof(it)];
            };

            var _forOf = createCommonjsModule(function (module) {
            var BREAK = {};
            var RETURN = {};
            var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
              var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
              var f = _ctx(fn, that, entries ? 2 : 1);
              var index = 0;
              var length, step, iterator, result;
              if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
              // fast case for arrays with default iterator
              if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
                result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
                if (result === BREAK || result === RETURN) return result;
              } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
                result = _iterCall(iterator, f, step.value, entries);
                if (result === BREAK || result === RETURN) return result;
              }
            };
            exports.BREAK = BREAK;
            exports.RETURN = RETURN;
            });

            // 7.3.20 SpeciesConstructor(O, defaultConstructor)


            var SPECIES = _wks('species');
            var _speciesConstructor = function (O, D) {
              var C = _anObject(O).constructor;
              var S;
              return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
            };

            // fast apply, http://jsperf.lnkit.com/fast-apply/5
            var _invoke = function (fn, args, that) {
              var un = that === undefined;
              switch (args.length) {
                case 0: return un ? fn()
                                  : fn.call(that);
                case 1: return un ? fn(args[0])
                                  : fn.call(that, args[0]);
                case 2: return un ? fn(args[0], args[1])
                                  : fn.call(that, args[0], args[1]);
                case 3: return un ? fn(args[0], args[1], args[2])
                                  : fn.call(that, args[0], args[1], args[2]);
                case 4: return un ? fn(args[0], args[1], args[2], args[3])
                                  : fn.call(that, args[0], args[1], args[2], args[3]);
              } return fn.apply(that, args);
            };

            var process$1 = _global.process;
            var setTask = _global.setImmediate;
            var clearTask = _global.clearImmediate;
            var MessageChannel = _global.MessageChannel;
            var Dispatch = _global.Dispatch;
            var counter = 0;
            var queue$1 = {};
            var ONREADYSTATECHANGE = 'onreadystatechange';
            var defer, channel, port;
            var run = function () {
              var id = +this;
              // eslint-disable-next-line no-prototype-builtins
              if (queue$1.hasOwnProperty(id)) {
                var fn = queue$1[id];
                delete queue$1[id];
                fn();
              }
            };
            var listener = function (event) {
              run.call(event.data);
            };
            // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
            if (!setTask || !clearTask) {
              setTask = function setImmediate(fn) {
                var args = [];
                var i = 1;
                while (arguments.length > i) args.push(arguments[i++]);
                queue$1[++counter] = function () {
                  // eslint-disable-next-line no-new-func
                  _invoke(typeof fn == 'function' ? fn : Function(fn), args);
                };
                defer(counter);
                return counter;
              };
              clearTask = function clearImmediate(id) {
                delete queue$1[id];
              };
              // Node.js 0.8-
              if (_cof(process$1) == 'process') {
                defer = function (id) {
                  process$1.nextTick(_ctx(run, id, 1));
                };
              // Sphere (JS game engine) Dispatch API
              } else if (Dispatch && Dispatch.now) {
                defer = function (id) {
                  Dispatch.now(_ctx(run, id, 1));
                };
              // Browsers with MessageChannel, includes WebWorkers
              } else if (MessageChannel) {
                channel = new MessageChannel();
                port = channel.port2;
                channel.port1.onmessage = listener;
                defer = _ctx(port.postMessage, port, 1);
              // Browsers with postMessage, skip WebWorkers
              // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
              } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
                defer = function (id) {
                  _global.postMessage(id + '', '*');
                };
                _global.addEventListener('message', listener, false);
              // IE8-
              } else if (ONREADYSTATECHANGE in _domCreate('script')) {
                defer = function (id) {
                  _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
                    _html.removeChild(this);
                    run.call(id);
                  };
                };
              // Rest old browsers
              } else {
                defer = function (id) {
                  setTimeout(_ctx(run, id, 1), 0);
                };
              }
            }
            var _task = {
              set: setTask,
              clear: clearTask
            };

            var macrotask = _task.set;
            var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
            var process$2 = _global.process;
            var Promise = _global.Promise;
            var isNode = _cof(process$2) == 'process';

            var _microtask = function () {
              var head, last, notify;

              var flush = function () {
                var parent, fn;
                if (isNode && (parent = process$2.domain)) parent.exit();
                while (head) {
                  fn = head.fn;
                  head = head.next;
                  try {
                    fn();
                  } catch (e) {
                    if (head) notify();
                    else last = undefined;
                    throw e;
                  }
                } last = undefined;
                if (parent) parent.enter();
              };

              // Node.js
              if (isNode) {
                notify = function () {
                  process$2.nextTick(flush);
                };
              // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
              } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
                var toggle = true;
                var node = document.createTextNode('');
                new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
                notify = function () {
                  node.data = toggle = !toggle;
                };
              // environments with maybe non-completely correct, but existent Promise
              } else if (Promise && Promise.resolve) {
                // Promise.resolve without an argument throws an error in LG WebOS 2
                var promise = Promise.resolve(undefined);
                notify = function () {
                  promise.then(flush);
                };
              // for other environments - macrotask based on:
              // - setImmediate
              // - MessageChannel
              // - window.postMessag
              // - onreadystatechange
              // - setTimeout
              } else {
                notify = function () {
                  // strange IE + webpack dev server bug - use .call(global)
                  macrotask.call(_global, flush);
                };
              }

              return function (fn) {
                var task = { fn: fn, next: undefined };
                if (last) last.next = task;
                if (!head) {
                  head = task;
                  notify();
                } last = task;
              };
            };

            // 25.4.1.5 NewPromiseCapability(C)


            function PromiseCapability(C) {
              var resolve, reject;
              this.promise = new C(function ($$resolve, $$reject) {
                if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
                resolve = $$resolve;
                reject = $$reject;
              });
              this.resolve = _aFunction(resolve);
              this.reject = _aFunction(reject);
            }

            var f$7 = function (C) {
              return new PromiseCapability(C);
            };

            var _newPromiseCapability = {
            	f: f$7
            };

            var _perform = function (exec) {
              try {
                return { e: false, v: exec() };
              } catch (e) {
                return { e: true, v: e };
              }
            };

            var navigator = _global.navigator;

            var _userAgent = navigator && navigator.userAgent || '';

            var _promiseResolve = function (C, x) {
              _anObject(C);
              if (_isObject(x) && x.constructor === C) return x;
              var promiseCapability = _newPromiseCapability.f(C);
              var resolve = promiseCapability.resolve;
              resolve(x);
              return promiseCapability.promise;
            };

            var _redefineAll = function (target, src, safe) {
              for (var key in src) {
                if (safe && target[key]) target[key] = src[key];
                else _hide(target, key, src[key]);
              } return target;
            };

            var SPECIES$1 = _wks('species');

            var _setSpecies = function (KEY) {
              var C = typeof _core[KEY] == 'function' ? _core[KEY] : _global[KEY];
              if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
                configurable: true,
                get: function () { return this; }
              });
            };

            var ITERATOR$3 = _wks('iterator');
            var SAFE_CLOSING = false;

            try {
              var riter = [7][ITERATOR$3]();
              riter['return'] = function () { SAFE_CLOSING = true; };
              // eslint-disable-next-line no-throw-literal
              Array.from(riter, function () { throw 2; });
            } catch (e) { /* empty */ }

            var _iterDetect = function (exec, skipClosing) {
              if (!skipClosing && !SAFE_CLOSING) return false;
              var safe = false;
              try {
                var arr = [7];
                var iter = arr[ITERATOR$3]();
                iter.next = function () { return { done: safe = true }; };
                arr[ITERATOR$3] = function () { return iter; };
                exec(arr);
              } catch (e) { /* empty */ }
              return safe;
            };

            var task = _task.set;
            var microtask = _microtask();




            var PROMISE = 'Promise';
            var TypeError$1 = _global.TypeError;
            var process$3 = _global.process;
            var versions$1 = process$3 && process$3.versions;
            var v8 = versions$1 && versions$1.v8 || '';
            var $Promise = _global[PROMISE];
            var isNode$1 = _classof(process$3) == 'process';
            var empty = function () { /* empty */ };
            var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
            var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

            var USE_NATIVE$1 = !!function () {
              try {
                // correct subclassing with @@species support
                var promise = $Promise.resolve(1);
                var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
                  exec(empty, empty);
                };
                // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
                return (isNode$1 || typeof PromiseRejectionEvent == 'function')
                  && promise.then(empty) instanceof FakePromise
                  // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
                  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
                  // we can't detect it synchronously, so just check versions
                  && v8.indexOf('6.6') !== 0
                  && _userAgent.indexOf('Chrome/66') === -1;
              } catch (e) { /* empty */ }
            }();

            // helpers
            var isThenable = function (it) {
              var then;
              return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
            };
            var notify = function (promise, isReject) {
              if (promise._n) return;
              promise._n = true;
              var chain = promise._c;
              microtask(function () {
                var value = promise._v;
                var ok = promise._s == 1;
                var i = 0;
                var run = function (reaction) {
                  var handler = ok ? reaction.ok : reaction.fail;
                  var resolve = reaction.resolve;
                  var reject = reaction.reject;
                  var domain = reaction.domain;
                  var result, then, exited;
                  try {
                    if (handler) {
                      if (!ok) {
                        if (promise._h == 2) onHandleUnhandled(promise);
                        promise._h = 1;
                      }
                      if (handler === true) result = value;
                      else {
                        if (domain) domain.enter();
                        result = handler(value); // may throw
                        if (domain) {
                          domain.exit();
                          exited = true;
                        }
                      }
                      if (result === reaction.promise) {
                        reject(TypeError$1('Promise-chain cycle'));
                      } else if (then = isThenable(result)) {
                        then.call(result, resolve, reject);
                      } else resolve(result);
                    } else reject(value);
                  } catch (e) {
                    if (domain && !exited) domain.exit();
                    reject(e);
                  }
                };
                while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
                promise._c = [];
                promise._n = false;
                if (isReject && !promise._h) onUnhandled(promise);
              });
            };
            var onUnhandled = function (promise) {
              task.call(_global, function () {
                var value = promise._v;
                var unhandled = isUnhandled(promise);
                var result, handler, console;
                if (unhandled) {
                  result = _perform(function () {
                    if (isNode$1) {
                      process$3.emit('unhandledRejection', value, promise);
                    } else if (handler = _global.onunhandledrejection) {
                      handler({ promise: promise, reason: value });
                    } else if ((console = _global.console) && console.error) {
                      console.error('Unhandled promise rejection', value);
                    }
                  });
                  // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
                  promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
                } promise._a = undefined;
                if (unhandled && result.e) throw result.v;
              });
            };
            var isUnhandled = function (promise) {
              return promise._h !== 1 && (promise._a || promise._c).length === 0;
            };
            var onHandleUnhandled = function (promise) {
              task.call(_global, function () {
                var handler;
                if (isNode$1) {
                  process$3.emit('rejectionHandled', promise);
                } else if (handler = _global.onrejectionhandled) {
                  handler({ promise: promise, reason: promise._v });
                }
              });
            };
            var $reject = function (value) {
              var promise = this;
              if (promise._d) return;
              promise._d = true;
              promise = promise._w || promise; // unwrap
              promise._v = value;
              promise._s = 2;
              if (!promise._a) promise._a = promise._c.slice();
              notify(promise, true);
            };
            var $resolve = function (value) {
              var promise = this;
              var then;
              if (promise._d) return;
              promise._d = true;
              promise = promise._w || promise; // unwrap
              try {
                if (promise === value) throw TypeError$1("Promise can't be resolved itself");
                if (then = isThenable(value)) {
                  microtask(function () {
                    var wrapper = { _w: promise, _d: false }; // wrap
                    try {
                      then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
                    } catch (e) {
                      $reject.call(wrapper, e);
                    }
                  });
                } else {
                  promise._v = value;
                  promise._s = 1;
                  notify(promise, false);
                }
              } catch (e) {
                $reject.call({ _w: promise, _d: false }, e); // wrap
              }
            };

            // constructor polyfill
            if (!USE_NATIVE$1) {
              // 25.4.3.1 Promise(executor)
              $Promise = function Promise(executor) {
                _anInstance(this, $Promise, PROMISE, '_h');
                _aFunction(executor);
                Internal.call(this);
                try {
                  executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
                } catch (err) {
                  $reject.call(this, err);
                }
              };
              // eslint-disable-next-line no-unused-vars
              Internal = function Promise(executor) {
                this._c = [];             // <- awaiting reactions
                this._a = undefined;      // <- checked in isUnhandled reactions
                this._s = 0;              // <- state
                this._d = false;          // <- done
                this._v = undefined;      // <- value
                this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
                this._n = false;          // <- notify
              };
              Internal.prototype = _redefineAll($Promise.prototype, {
                // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
                then: function then(onFulfilled, onRejected) {
                  var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
                  reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
                  reaction.fail = typeof onRejected == 'function' && onRejected;
                  reaction.domain = isNode$1 ? process$3.domain : undefined;
                  this._c.push(reaction);
                  if (this._a) this._a.push(reaction);
                  if (this._s) notify(this, false);
                  return reaction.promise;
                },
                // 25.4.5.1 Promise.prototype.catch(onRejected)
                'catch': function (onRejected) {
                  return this.then(undefined, onRejected);
                }
              });
              OwnPromiseCapability = function () {
                var promise = new Internal();
                this.promise = promise;
                this.resolve = _ctx($resolve, promise, 1);
                this.reject = _ctx($reject, promise, 1);
              };
              _newPromiseCapability.f = newPromiseCapability = function (C) {
                return C === $Promise || C === Wrapper
                  ? new OwnPromiseCapability(C)
                  : newGenericPromiseCapability(C);
              };
            }

            _export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Promise: $Promise });
            _setToStringTag($Promise, PROMISE);
            _setSpecies(PROMISE);
            Wrapper = _core[PROMISE];

            // statics
            _export(_export.S + _export.F * !USE_NATIVE$1, PROMISE, {
              // 25.4.4.5 Promise.reject(r)
              reject: function reject(r) {
                var capability = newPromiseCapability(this);
                var $$reject = capability.reject;
                $$reject(r);
                return capability.promise;
              }
            });
            _export(_export.S + _export.F * (_library ), PROMISE, {
              // 25.4.4.6 Promise.resolve(x)
              resolve: function resolve(x) {
                return _promiseResolve( this === Wrapper ? $Promise : this, x);
              }
            });
            _export(_export.S + _export.F * !(USE_NATIVE$1 && _iterDetect(function (iter) {
              $Promise.all(iter)['catch'](empty);
            })), PROMISE, {
              // 25.4.4.1 Promise.all(iterable)
              all: function all(iterable) {
                var C = this;
                var capability = newPromiseCapability(C);
                var resolve = capability.resolve;
                var reject = capability.reject;
                var result = _perform(function () {
                  var values = [];
                  var index = 0;
                  var remaining = 1;
                  _forOf(iterable, false, function (promise) {
                    var $index = index++;
                    var alreadyCalled = false;
                    values.push(undefined);
                    remaining++;
                    C.resolve(promise).then(function (value) {
                      if (alreadyCalled) return;
                      alreadyCalled = true;
                      values[$index] = value;
                      --remaining || resolve(values);
                    }, reject);
                  });
                  --remaining || resolve(values);
                });
                if (result.e) reject(result.v);
                return capability.promise;
              },
              // 25.4.4.4 Promise.race(iterable)
              race: function race(iterable) {
                var C = this;
                var capability = newPromiseCapability(C);
                var reject = capability.reject;
                var result = _perform(function () {
                  _forOf(iterable, false, function (promise) {
                    C.resolve(promise).then(capability.resolve, reject);
                  });
                });
                if (result.e) reject(result.v);
                return capability.promise;
              }
            });

            _export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
              var C = _speciesConstructor(this, _core.Promise || _global.Promise);
              var isFunction = typeof onFinally == 'function';
              return this.then(
                isFunction ? function (x) {
                  return _promiseResolve(C, onFinally()).then(function () { return x; });
                } : onFinally,
                isFunction ? function (e) {
                  return _promiseResolve(C, onFinally()).then(function () { throw e; });
                } : onFinally
              );
            } });

            // https://github.com/tc39/proposal-promise-try




            _export(_export.S, 'Promise', { 'try': function (callbackfn) {
              var promiseCapability = _newPromiseCapability.f(this);
              var result = _perform(callbackfn);
              (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
              return promiseCapability.promise;
            } });

            var promise = _core.Promise;

            var promise$1 = createCommonjsModule(function (module) {
            module.exports = { "default": promise, __esModule: true };
            });

            var _Promise = unwrapExports(promise$1);

            //tween最小过渡时间
            var minDuration = 100;
            var placeholderTransaction = _Symbol();

            var Segment = function (_EventDispatcher) {
                _inherits(Segment, _EventDispatcher);

                function Segment(name) {
                    _classCallCheck(this, Segment);

                    var _this = _possibleConstructorReturn(this, (Segment.__proto__ || _Object$getPrototypeOf(Segment)).call(this));

                    _this._transactions = [];
                    _this._totalTime = minDuration;
                    _this._name = name;

                    //为了回放有正确的结尾等待，顾创建一个默认从0开始的transaction。
                    var placeholderTransactionFn = function placeholderTransactionFn() {};
                    var tween = createTween.call(_this, {
                        type: "point",
                        value: 0,
                        fn: placeholderTransactionFn
                    });
                    _this._transactions.push({
                        tween: tween,
                        fn: placeholderTransactionFn,
                        name: placeholderTransaction,
                        type: "point",
                        value: 0
                    });
                    return _this;
                }

                _createClass(Segment, [{
                    key: "start",
                    value: function start() {
                        for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
                            names[_key] = arguments[_key];
                        }

                        segmentRun.call.apply(segmentRun, [this].concat(names, [false]));
                    }
                }, {
                    key: "forceStart",
                    value: function forceStart() {
                        for (var _len2 = arguments.length, names = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            names[_key2] = arguments[_key2];
                        }

                        var transactions = void 0;

                        if (names.length > 0) {
                            transactions = this._transactions.filter(function (_ref) {
                                var name = _ref.name;
                                return names.includes(name);
                            });
                        } else {
                            transactions = this._transactions;
                        }

                        if (transactions.length === 0) return false;

                        transactions.forEach(function (_ref2) {
                            var tween = _ref2.tween;

                            tween.stop();
                        });
                        this.start.apply(this, names);
                    }
                }, {
                    key: "playback",
                    value: function playback() {
                        for (var _len3 = arguments.length, names = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                            names[_key3] = arguments[_key3];
                        }

                        segmentRun.call.apply(segmentRun, [this].concat(names, [true]));
                    }
                }, {
                    key: "forcePlayback",
                    value: function forcePlayback() {
                        for (var _len4 = arguments.length, names = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                            names[_key4] = arguments[_key4];
                        }

                        var transactions = void 0;

                        if (names.length > 0) {
                            transactions = this._transactions.filter(function (_ref3) {
                                var name = _ref3.name;
                                return names.includes(name);
                            });
                        } else {
                            transactions = this._transactions;
                        }

                        if (transactions.length === 0) return false;

                        transactions.forEach(function (_ref4) {
                            var tween = _ref4.tween;

                            tween.stop();
                        });
                        this.playback.apply(this, names);
                    }
                }, {
                    key: "stop",
                    value: function stop() {
                        var _this2 = this;

                        for (var _len5 = arguments.length, names = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                            names[_key5] = arguments[_key5];
                        }

                        // if (!this._isPlaying) return false;

                        // this._isPlaying = false;

                        var transactions = void 0;

                        if (names.length > 0) {
                            transactions = this._transactions.filter(function (transaction) {
                                var name = transaction.name,
                                    tween = transaction.tween;
                                //执行了stop的事务强行标识为stop，防止有提前完成的事务标识为complete导致，链接到下一个片段上。（我们链接下一位的条件是片段只要有一个事务为complete就可以触发下一位）

                                if (names.includes(name)) transaction.finishType = "stop";
                                return names.includes(name) && tween._isPlaying;
                            });
                        } else {
                            transactions = this._transactions.filter(function (transaction) {
                                //执行了stop的事务强行标识为stop，防止有提前完成的事务标识为complete导致，链接到下一个片段上。（我们链接下一位的条件是片段只要有一个事务为complete就可以触发下一位）
                                var tween = transaction.tween;

                                transaction.finishType = "stop";
                                return tween._isPlaying;
                            });
                        }

                        if (transactions.length === 0) return false;

                        var stopElements = transactions.map(function (_ref5) {
                            var tween = _ref5.tween,
                                fn = _ref5.fn;

                            return new _Promise(function (resolve) {
                                if (tween._isPlaying === false) {
                                    resolve();
                                } else {
                                    tween._onStop(function () {
                                        resolve();
                                    });
                                }
                            });
                        });

                        _Promise.all(stopElements).then(function () {
                            _this2.dispatchEvent({ type: STOP, transactions: transactions });
                        });

                        transactions.forEach(function (_ref6) {
                            var tween = _ref6.tween;

                            tween.stop();
                        });
                    }
                }, {
                    key: "pause",
                    value: function pause() {
                        var _this3 = this;

                        for (var _len6 = arguments.length, names = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                            names[_key6] = arguments[_key6];
                        }

                        //暂停中或非运行中就阻止
                        // if (this._isPaused || !this._isPlaying) return false;

                        // this._isPaused = true;

                        var transactions = void 0;

                        if (names.length > 0) {
                            transactions = this._transactions.filter(function (_ref7) {
                                var name = _ref7.name,
                                    tween = _ref7.tween;
                                return names.includes(name) && !tween._isPaused && tween._isPlaying;
                            });
                        } else {
                            transactions = this._transactions.filter(function (_ref8) {
                                var tween = _ref8.tween;
                                return !tween._isPaused && tween._isPlaying;
                            });
                        }

                        if (transactions.length === 0) return false;
                        var pauseElements = transactions.map(function (_ref9) {
                            var tween = _ref9.tween,
                                fn = _ref9.fn;

                            return new _Promise(function (resolve) {
                                // if (tween._isPlaying === false) {
                                //     resolve();
                                // } else {
                                tween._onPause(function () {
                                    resolve();
                                });
                                // }
                            });
                        });

                        _Promise.all(pauseElements).then(function () {
                            _this3.dispatchEvent({ type: PAUSE, transactions: transactions });
                        });

                        transactions.forEach(function (_ref10) {
                            var tween = _ref10.tween;

                            tween.pause();
                        });
                    }
                }, {
                    key: "resume",
                    value: function resume() {
                        var _this4 = this;

                        for (var _len7 = arguments.length, names = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                            names[_key7] = arguments[_key7];
                        }

                        //没有暂停或非运行中就阻止
                        // if (!this._isPaused || !this._isPlaying) return false;

                        // this._isPaused = false;

                        var transactions = void 0;

                        if (names.length > 0) {
                            transactions = this._transactions.filter(function (_ref11) {
                                var name = _ref11.name,
                                    tween = _ref11.tween;
                                return names.includes(name) && tween._isPaused && tween._isPlaying;
                            });
                        } else {
                            transactions = this._transactions.filter(function (_ref12) {
                                var tween = _ref12.tween;
                                return tween._isPaused && tween._isPlaying;
                            });
                        }

                        if (transactions.length === 0) return false;

                        var resumeElements = transactions.map(function (_ref13) {
                            var tween = _ref13.tween,
                                fn = _ref13.fn;

                            return new _Promise(function (resolve) {
                                // if (tween._isPlaying === false) {
                                //     resolve();
                                // } else {
                                tween._onResume(function () {
                                    resolve();
                                });
                                // }
                            });
                        });

                        _Promise.all(resumeElements).then(function () {
                            _this4.dispatchEvent({ type: RESUME, transactions: transactions });
                        });

                        transactions.forEach(function (_ref14) {
                            var tween = _ref14.tween;

                            tween.resume();
                        });
                    }
                }, {
                    key: "chain",
                    value: function chain(nextSegment) {
                        if (nextSegment instanceof Segment) {
                            //是否执行回放
                            var playback = false;

                            for (var _len8 = arguments.length, names = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
                                names[_key8 - 1] = arguments[_key8];
                            }

                            if (typeof names[names.length - 1] === "boolean") {
                                playback = names.pop();
                            }
                            this._nextSegment = nextSegment;

                            if (!playback) {
                                var _nextSegment$start;

                                this._nextSegmentStrat = (_nextSegment$start = nextSegment.start).bind.apply(_nextSegment$start, [nextSegment].concat(names));
                            } else {
                                var _nextSegment$playback;

                                this._nextSegmentStrat = (_nextSegment$playback = nextSegment.playback).bind.apply(_nextSegment$playback, [nextSegment].concat(names));
                            }
                        }
                        return this;
                    }
                }, {
                    key: "removeChain",
                    value: function removeChain() {
                        delete this._nextSegment;
                        delete this._nextSegmentStrat;
                    }
                }, {
                    key: "transaction",
                    value: function transaction() {
                        for (var _len9 = arguments.length, arg = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                            arg[_key9] = arguments[_key9];
                        }

                        var options = {};
                        if (Object.prototype.toString.call(arg[arg.length - 1]) === "[object Object]") {
                            options = arg.pop();
                        }

                        var _options = options,
                            name = _options.name,
                            _options$easing = _options.easing,
                            easing = _options$easing === undefined ? TimeLine.Easing.Linear.None : _options$easing;


                        if (typeof easing !== "function") {
                            throw new Error("easing is function!");
                        }

                        if (typeof name !== "undefined" && typeof name !== "string") {
                            throw new Error("name is string!");
                        }

                        var fn = arg.pop();
                        //此参数必须为fn
                        if (typeof fn !== "function") {
                            throw new Error("You need to pass in a function!");
                        }

                        if (arg.length === 1) {
                            if (typeof arg[0] !== "number" || arg[0] < 0) {
                                throw new Error("Invalid time value! should time >= 0.");
                            }
                            var tween = createTween.call(this, {
                                type: "point",
                                value: arg[0],
                                fn: fn
                            });
                            this._transactions.push({
                                tween: tween,
                                fn: fn,
                                name: name,
                                type: "point",
                                value: arg[0]
                            });
                            this._totalTime = Math.max(this._totalTime, arg[0]);
                        } else if (arg.length === 2) {
                            if (typeof arg[0] !== "number" || typeof arg[1] !== "number" || arg[0] < 0 || arg[1] < 0) {
                                throw new Error("Invalid time value! should time >= 0.");
                            }
                            if (arg[0] >= arg[1]) {
                                throw new Error("arg[0] < arg[1]!");
                            }

                            var _tween = createTween.call(this, {
                                type: "interval",
                                value: arg,
                                fn: fn,
                                easing: easing
                            });
                            this._transactions.push({
                                tween: _tween,
                                fn: fn,
                                name: name,
                                type: "interval",
                                value: arg
                            });
                            this._totalTime = Math.max(this._totalTime, arg[1]);
                        } else {
                            throw new Error("Invalid arguments!");
                        }

                        return this;
                    }
                }, {
                    key: "remove",
                    value: function remove() {
                        var _this5 = this;

                        for (var _len10 = arguments.length, names = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                            names[_key10] = arguments[_key10];
                        }

                        if (names === 0) return;

                        var prevLength = this._transactions.length;
                        this._transactions = this._transactions.filter(function (_ref15) {
                            var name = _ref15.name;
                            return !names.includes(name) || name === placeholderTransaction;
                        });
                        var currentLength = this._transactions.length;

                        if (prevLength === currentLength) return;

                        this._totalTime = 0;
                        this._transactions.forEach(function (_ref16) {
                            var type = _ref16.type,
                                value = _ref16.value;

                            if (type === "point") {
                                _this5._totalTime = Math.max(_this5._totalTime, value);
                            } else if (type === "interval") {
                                _this5._totalTime = Math.max(_this5._totalTime, value[1]);
                            } else {
                                throw new Error("transaction type error!");
                            }
                        });
                    }
                }]);

                return Segment;
            }(EventDispatcher);


            function createTween(_ref17) {
                var _this6 = this;

                var type = _ref17.type,
                    value = _ref17.value,
                    fn = _ref17.fn,
                    easing = _ref17.easing;

                var tween = void 0;

                if (type === "interval") {
                    tween = new TWEEN.Tween({
                        time: value[0]
                    });
                    tween.to({
                        time: value[1]
                    }, value[1] - value[0]);
                    tween._onUpdate(function (_ref18) {
                        var time = _ref18.time;

                        var percent = (time - value[0]) / (value[1] - value[0]);
                        var globalPercent = time / _this6._totalTime;
                        fn(time, percent, globalPercent);
                    });
                    if (easing) tween.easing(easing);
                } else if (type === "point") {
                    tween = new TWEEN.Tween({
                        time: value
                    });
                    tween.duration(minDuration);
                }

                tween._onStart(function (_ref19) {
                    var time = _ref19.time;

                    fn(time, 0, time / _this6._totalTime);
                });
                return tween;
            }

            function segmentRun() {
                var _this7 = this;

                for (var _len11 = arguments.length, names = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
                    names[_key11] = arguments[_key11];
                }

                //是否执行回放
                var playback = false;
                if (typeof names[names.length - 1] === "boolean") {
                    playback = names.pop();
                }

                var transactions = void 0;

                if (names.length > 0) {
                    transactions = this._transactions.filter(function (_ref20) {
                        var name = _ref20.name,
                            tween = _ref20.tween;
                        return names.includes(name) && !tween._isPlaying;
                    });
                } else {
                    transactions = this._transactions.filter(function (_ref21) {
                        var tween = _ref21.tween;
                        return !tween._isPlaying;
                    });
                }

                if (transactions.length === 0) return false;

                //开始
                var startElements = transactions.map(function (_ref22) {
                    var tween = _ref22.tween,
                        fn = _ref22.fn;

                    return new _Promise(function (resolve) {
                        tween._onStart(function (_ref23) {
                            var time = _ref23.time;

                            fn(time, 0, time / _this7._totalTime);
                            resolve();
                        });
                    });
                });

                _Promise.race(startElements).then(function () {
                    _this7.dispatchEvent({ type: START, transactions: transactions });
                });

                //完整的结束
                var completeElements = transactions.map(function (_ref24) {
                    var tween = _ref24.tween,
                        type = _ref24.type,
                        value = _ref24.value;

                    return new _Promise(function (resolve) {
                        tween._onComplete(function () {
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

                _Promise.all(completeElements).then(function () {
                    // this._isPlaying = false;
                    _this7.dispatchEvent({ type: COMPLETE, transactions: transactions });
                    //如果有定义下一个衔接的片段
                    // if (this._nextSegment instanceof Segment) this._nextSegment.start();
                });

                //结束
                var finishElements = transactions.map(function (transaction) {
                    var tween = transaction.tween,
                        type = transaction.type,
                        value = transaction.value;

                    return new _Promise(function (resolve) {
                        tween._onFinish(function (o, finishType) {
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

                _Promise.all(finishElements).then(function () {
                    var result = transactions.map(function (_ref25) {
                        var finishType = _ref25.finishType;
                        return finishType;
                    });
                    //如果有定义下一个衔接的片段，并且没有全部停止，接衔接
                    if (typeof _this7._nextSegmentStrat === "function" && result.includes("complete")) {
                        //先开始在结束，防止_currentSegment有间隙无法正常操作
                        if (_this7._nextSegment.hasEventListener(START, _this7._currentSegmentFinish2nextSegmentStartCallback)) {
                            _this7._nextSegment.removeEventListener(START, _this7._currentSegmentFinish2nextSegmentStartCallback);
                        }
                        _this7._currentSegmentFinish2nextSegmentStartCallback = function () {
                            _this7._nextSegment.removeEventListener(START, _this7._currentSegmentFinish2nextSegmentStartCallback);
                            _this7._currentSegmentFinish2nextSegmentStartCallback = null;
                            _this7.dispatchEvent({ type: FINISH, transactions: transactions });
                        };
                        _this7._nextSegment.addEventListener(START, _this7._currentSegmentFinish2nextSegmentStartCallback);
                        _this7._nextSegmentStrat();
                    } else {
                        _this7.dispatchEvent({ type: FINISH, transactions: transactions });
                    }
                });

                transactions.forEach(function (_ref26) {
                    var tween = _ref26.tween,
                        type = _ref26.type,
                        value = _ref26.value;

                    if (!playback) {
                        if (type === "interval") {
                            tween.delay(value[0]);
                        } else if (type === "point") {
                            tween.delay(value);
                        }
                    } else {
                        if (type === "interval") {
                            tween.delay(_this7._totalTime - value[1]);
                        } else if (type === "point") {
                            tween.delay(_this7._totalTime - value);
                        }
                    }
                    tween.playback(playback);
                    tween.start();
                });

                // this.dispatchEvent({ type: START, transactions });
            }

            var Arrange = function (_EventDispatcher) {
                _inherits(Arrange, _EventDispatcher);

                function Arrange(segments) {
                    _classCallCheck(this, Arrange);

                    var _this = _possibleConstructorReturn(this, (Arrange.__proto__ || _Object$getPrototypeOf(Arrange)).call(this));

                    _this._segments = segments;
                    _this._type = "forward";

                    _this._isPlaying = false;
                    _this._isPaused = false;

                    //监听片段执行开始时回调
                    var length = _this._segments.length;

                    var _loop = function _loop(i) {
                        var currentSegment = _this._segments[i];

                        currentSegment.addEventListener(START, function () {
                            //如果排序处于停止状态则取消监听
                            if (!_this._isPlaying) return;
                            _this._currentSegment = currentSegment;
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
                    };

                    for (var i = 0; i < length; i++) {
                        _loop(i);
                    }
                    return _this;
                }

                // disable() {
                //     this._enabled = false;
                // }
                // enable() {
                //     this._enabled = true;
                // }

                //可以自定义开始位置


                _createClass(Arrange, [{
                    key: "start",
                    value: function start(customSegment) {
                        var _this2 = this;

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

                        if (!(this._startSegment instanceof Segment) || typeof this._startSegmentStart !== "function") {
                            this._isPlaying = false;
                            // this._enabled = enabled;
                            throw new Error("start segment not instanceof Segment!");
                        }

                        /*结束*/
                        //如果存在未完成的结束事件回调则先移除
                        if (this._endSegment.hasEventListener(FINISH, this._endSegmentFinishCallback)) {
                            this._endSegment.removeEventListener(FINISH, this._endSegmentFinishCallback);
                        }
                        //结束事件回调
                        this._endSegmentFinishCallback = function (_ref) {
                            var transactions = _ref.transactions;

                            if (!_this2._isPlaying) return;
                            _this2._isPlaying = false;

                            //完成后移除回调
                            _this2._endSegment.removeEventListener(FINISH, _this2._endSegmentFinishCallback);
                            _this2._endSegmentFinishCallback = undefined;

                            var result = transactions.map(function (_ref2) {
                                var finishType = _ref2.finishType;
                                return finishType;
                            });
                            //如果有定义下一个衔接的片段，并且没有全部停止，接衔接
                            if (typeof _this2._nextArrangeStrat === "function" && result.includes("complete")) {
                                if (_this2._nextArrange.hasEventListener(START, _this2._currentArrangeFinish2nextArrangeStartCallback)) {
                                    _this2._nextArrange.removeEventListener(START, _this2._currentArrangeFinish2nextArrangeStartCallback);
                                }
                                _this2._currentArrangeFinish2nextArrangeStartCallback = function () {
                                    _this2._nextArrange.removeEventListener(START, _this2._currentArrangeFinish2nextArrangeStartCallback);
                                    _this2._currentArrangeFinish2nextArrangeStartCallback = null;
                                    _this2.dispatchEvent({
                                        type: FINISH
                                    });
                                };
                                _this2._nextArrange.addEventListener(START, _this2._currentArrangeFinish2nextArrangeStartCallback);

                                _this2._nextArrangeStrat();
                            } else {
                                _this2.dispatchEvent({
                                    type: FINISH
                                });
                            }

                            // this.disable();
                        };

                        this._endSegment.addEventListener(FINISH, this._endSegmentFinishCallback);

                        /*完整的结束*/
                        //如果存在未完成的完整结束事件回调则先移除
                        if (this._endSegment.hasEventListener(COMPLETE, this._endSegmentCompleteCallback)) {
                            this._endSegment.removeEventListener(COMPLETE, this._endSegmentCompleteCallback);
                        }
                        this._endSegmentCompleteCallback = function (event) {
                            //如果事件监听处于关闭状态则取消监听
                            if (!_this2._isPlaying) return;

                            //完成后移除回调
                            _this2._endSegment.removeEventListener(COMPLETE, _this2._endSegmentCompleteCallback);
                            _this2._endSegmentCompleteCallback = undefined;

                            _this2.dispatchEvent({
                                type: COMPLETE
                            });
                        };
                        this._endSegment.addEventListener(COMPLETE, this._endSegmentCompleteCallback);

                        //开始事件
                        if (this._startSegment.hasEventListener(START, this._startSegmentCompleteCallback)) {
                            this._startSegment.removeEventListener(START, this._startSegmentCompleteCallback);
                        }
                        this._startSegmentCompleteCallback = function () {
                            _this2._startSegment.removeEventListener(START, _this2._startSegmentCompleteCallback);
                            _this2._startSegmentCompleteCallback = undefined;
                            _this2.dispatchEvent({
                                type: START
                            });
                        };
                        this._startSegment.addEventListener(START, this._startSegmentCompleteCallback);

                        this._startSegmentStart();
                    }
                }, {
                    key: "stop",
                    value: function stop() {
                        var _this3 = this;

                        if (!this._isPlaying) {
                            return false;
                        }
                        if (this._currentSegment instanceof Segment) {

                            if (this._currentSegment !== this._endSegment) {

                                if (this._currentSegment.hasEventListener(FINISH, this._currentSegmentFinishForStopCallback)) {
                                    this._currentSegment.removeEventListener(FINISH, this._currentSegmentFinishForStopCallback);
                                }
                                this._currentSegmentFinishForStopCallback = function () {
                                    _this3._isPlaying = false;
                                    _this3._currentSegment.removeEventListener(FINISH, _this3._currentSegmentFinishForStopCallback);
                                    _this3._currentSegmentFinishForStopCallback = undefined;
                                    _this3.dispatchEvent({
                                        type: FINISH
                                    });
                                };
                                this._currentSegment.addEventListener(FINISH, this._currentSegmentFinishForStopCallback);                    // this.dispatchEvent({
                                //     type: FINISH
                                // });
                            }
                            this._currentSegment.stop();
                            this.dispatchEvent({
                                type: STOP
                            });
                        }
                    }
                }, {
                    key: "pause",
                    value: function pause() {
                        var _this4 = this;

                        if (!this._isPlaying || this._isPaused) {
                            return false;
                        }
                        if (this._currentSegment instanceof Segment) {
                            if (this._currentSegment.hasEventListener(PAUSE, this._currentSegmentPauseCallback)) {
                                this._currentSegment.removeEventListener(PAUSE, this._currentSegmentPauseCallback);
                            }
                            this._currentSegmentPauseCallback = function () {
                                _this4._isPaused = true;
                                _this4._currentSegment.removeEventListener(PAUSE, _this4._currentSegmentPauseCallback);
                                _this4._currentSegmentPauseCallback = undefined;
                                _this4.dispatchEvent({
                                    type: PAUSE
                                });
                            };
                            this._currentSegment.addEventListener(PAUSE, this._currentSegmentPauseCallback);
                            this._currentSegment.pause();
                        }
                    }
                }, {
                    key: "resume",
                    value: function resume() {
                        var _this5 = this;

                        if (!this._isPlaying || !this._isPaused) {
                            return false;
                        }
                        if (this._currentSegment instanceof Segment) {
                            if (this._currentSegment.hasEventListener(RESUME, this._currentSegmentResumeCallback)) {
                                this._currentSegment.removeEventListener(RESUME, this._currentSegmentResumeCallback);
                            }
                            this._currentSegmentResumeCallback = function () {
                                _this5._isPaused = false;
                                _this5._currentSegment.removeEventListener(RESUME, _this5._currentSegmentResumeCallback);
                                _this5._currentSegmentResumeCallback = undefined;
                                _this5.dispatchEvent({
                                    type: RESUME
                                });
                            };
                            this._currentSegment.addEventListener(RESUME, this._currentSegmentResumeCallback);
                            this._currentSegment.resume();
                        }
                    }
                }, {
                    key: "chain",
                    value: function chain(nextArrange) {
                        if (nextArrange instanceof Arrange) {
                            this._nextArrange = nextArrange;
                            this._nextArrangeStrat = nextArrange.start.bind(nextArrange);
                        }
                    }
                }, {
                    key: "removeChain",
                    value: function removeChain() {
                        delete this._nextArrange;
                        delete this._nextArrangeStrat;
                    }
                }, {
                    key: "execute",
                    value: function execute(segment) {
                        var _this6 = this;

                        if (!this._isPlaying || !(segment instanceof Segment) || this._executeing) {
                            return false;
                        }

                        this._executeing = true;

                        var isPaused = this._isPaused;

                        //如果存在_executeFinishCallback就先移除，有了_executeing，可能并不需要但是为了保险
                        if (this.hasEventListener(FINISH, this._executeForPrevFinishCallback)) {
                            this.removeEventListener(FINISH, this._executeForPrevFinishCallback);
                        }
                        this._executeForPrevFinishCallback = function () {
                            //如果是暂停的就切换到对应segment后执行完就暂停
                            if (isPaused) {
                                if (segment.hasEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback)) {
                                    segment.removeEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                                }
                                _this6._executeForTargetSegmentFinishCallback = function () {
                                    _this6.pause();
                                    _this6._executeing = false;
                                    segment.removeEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                                    _this6._executeForTargetSegmentFinishCallback = undefined;
                                };
                                segment.addEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                            } else {
                                _this6._executeing = false;
                            }

                            _this6.start(segment);

                            _this6.removeEventListener(FINISH, _this6._executeForPrevFinishCallback);
                            _this6._executeForPrevFinishCallback = undefined;
                        };
                        this.addEventListener(FINISH, this._executeForPrevFinishCallback);

                        //无论如何先停止
                        this.stop();
                    }
                }, {
                    key: "switch",
                    value: function _switch(segment) {
                        var _this7 = this;

                        if (!this._isPlaying || !(segment instanceof Segment) || this._switching) {
                            return false;
                        }

                        this._switching = true;

                        var isPaused = this._isPaused;

                        //如果存在_switchFinishCallback就先移除，有了_switching，可能并不需要但是为了保险
                        if (this.hasEventListener(FINISH, this._switchForPrevFinishCallback)) {
                            this.removeEventListener(FINISH, this._switchForPrevFinishCallback);
                        }
                        this._switchForPrevFinishCallback = function () {
                            //如果是暂停的就切换到对应segment后就暂停
                            if (isPaused) {
                                if (_this7.hasEventListener(START, _this7._switchForStartAfterCallback)) {
                                    _this7.removeEventListener(START, _this7._switchForStartAfterCallback);
                                }
                                _this7._switchForStartAfterCallback = function () {
                                    _this7.pause();
                                    _this7._switching = false;
                                    _this7.removeEventListener(START, _this7._switchForStartAfterCallback);
                                    _this7._switchForStartAfterCallback = undefined;
                                };
                                _this7.addEventListener(START, _this7._switchForStartAfterCallback);
                            } else {
                                _this7._switching = false;
                            }
                            _this7.start(segment);
                            _this7.removeEventListener(FINISH, _this7._switchForPrevFinishCallback);
                            _this7._switchForPrevFinishCallback = undefined;
                        };
                        this.addEventListener(FINISH, this._switchForPrevFinishCallback);

                        //无论如何先停止
                        this.stop();
                    }
                }, {
                    key: "forward",
                    value: function forward() {
                        this._type = "forward";
                    }
                }, {
                    key: "back",
                    value: function back() {
                        this._type = "back";
                    }
                }]);

                return Arrange;
            }(EventDispatcher);


            var arrangeMode = {
                discrete: function discrete() {
                    var length = this._segments.length;
                    for (var i = 0; i < length; i++) {
                        this._segments[i].removeChain();
                    }
                },
                forward: function forward(customSegment) {
                    arrangeMode.discrete.call(this);
                    var length = this._segments.length;
                    for (var i = 0; i < length; i++) {
                        var _currentSegment = this._segments[i];
                        var nextSegment = this._segments[i + 1];

                        //只有当前片段和下一片段都存在的情况才能使用chain
                        if (_currentSegment instanceof Segment && nextSegment instanceof Segment) {
                            _currentSegment.chain(nextSegment);
                        }
                    }

                    if (customSegment instanceof Segment && this._segments.includes(customSegment)) {
                        this._startSegment = customSegment;
                    } else {
                        this._startSegment = this._segments[0];
                    }

                    this._startSegmentStart = this._startSegment.start.bind(this._startSegment);

                    this._endSegment = this._segments[length - 1];
                },
                back: function back(customSegment) {
                    arrangeMode.discrete.call(this);
                    var length = this._segments.length;
                    this._endSegment = this._segments[0];
                    for (var i = length - 1; i >= 0; i--) {
                        var _currentSegment2 = this._segments[i];
                        var nextSegment = this._segments[i - 1];

                        //只有当前片段和下一片段都存在的情况才能使用chain
                        if (_currentSegment2 instanceof Segment && nextSegment instanceof Segment) {
                            _currentSegment2.chain(nextSegment, true);
                        }
                    }
                    if (customSegment instanceof Segment && this._segments.includes(customSegment)) {
                        this._startSegment = customSegment;
                    } else {
                        this._startSegment = this._segments[length - 1];
                    }
                    this._startSegmentStart = this._startSegment.playback.bind(this._startSegment);
                    this._endSegment = this._segments[0];
                }
            };

            var TimeLine$1 = function (_EventDispatcher) {
                _inherits(TimeLine, _EventDispatcher);

                function TimeLine() {
                    _classCallCheck(this, TimeLine);

                    var _this = _possibleConstructorReturn(this, (TimeLine.__proto__ || _Object$getPrototypeOf(TimeLine)).call(this));

                    _this._segments = [];
                    _this._currentArrange;
                    _this._isPlaying = false;
                    _this._isPaused = false;
                    _this._repeat = 1;

                    _this._arrangements = [];
                    return _this;
                }

                _createClass(TimeLine, [{
                    key: "addSegment",
                    value: function addSegment() {
                        var _segments;

                        for (var _len = arguments.length, segments = Array(_len), _key = 0; _key < _len; _key++) {
                            segments[_key] = arguments[_key];
                        }

                        segments.forEach(function (segment) {
                            if (!(segment instanceof Segment)) throw new Error("not instanceof Segment!");
                        });
                        (_segments = this._segments).push.apply(_segments, segments);
                    }
                }, {
                    key: "pushForwardArrange",
                    value: function pushForwardArrange() {
                        var arrange = new Arrange(this._segments);
                        arrange.forward();
                        arrangeEventBind.call(this, arrange);
                        this._arrangements.push(arrange);
                        return arrange;
                    }
                }, {
                    key: "pushBackArrange",
                    value: function pushBackArrange() {
                        var arrange = new Arrange(this._segments);
                        arrange.back();
                        arrangeEventBind.call(this, arrange);
                        this._arrangements.push(arrange);
                        return arrange;
                    }
                }, {
                    key: "getArrangements",
                    value: function getArrangements() {
                        return this._arrangements;
                    }
                }, {
                    key: "clearArrangements",
                    value: function clearArrangements() {
                        this._arrangements = [];
                    }
                }, {
                    key: "start",
                    value: function start() {
                        var _this2 = this;

                        if (this._isPlaying) {
                            return false;
                        }

                        var customArrange = void 0;
                        var customSegment = void 0;

                        if (arguments.length > 0) {
                            if (arguments.length === 1) {
                                customSegment = arguments.length <= 0 ? undefined : arguments[0];
                            } else {
                                customArrange = arguments.length <= 0 ? undefined : arguments[0];
                                customSegment = arguments.length <= 1 ? undefined : arguments[1];
                            }
                        }

                        this._isPlaying = true;
                        this._isPaused = false;

                        var length = this._arrangements.length;
                        //如果没有追加排列那么默认正序排列
                        if (length === 0) {
                            var defaultArrange = this.pushForwardArrange();
                            //使用默认排序后会清理排序集合
                            this._defaultArrangeForPrevFinishCallback = function () {
                                defaultArrange.removeEventListener(FINISH, _this2._defaultArrangeForPrevFinishCallback);
                                _this2._defaultArrangeForPrevFinishCallback = undefined;
                                _this2.clearArrangements();
                            };
                            defaultArrange.addEventListener(FINISH, this._defaultArrangeForPrevFinishCallback);
                            length = 1;
                        }

                        for (var i = 0; i < length; i++) {
                            var currentArrange = this._arrangements[i];
                            var nextArrange = this._arrangements[i + 1];
                            if (currentArrange instanceof Arrange && nextArrange instanceof Arrange) {
                                currentArrange.chain(nextArrange);
                            }
                        }

                        //如果自定义了开始的排序
                        if (customArrange instanceof Arrange && this._arrangements.includes(customArrange)) {
                            this._startArrange = customArrange;
                        } else {
                            this._startArrange = this._arrangements[0];
                        }
                        this._endArrange = this._arrangements[length - 1];

                        //已经循环的次数
                        if (this._endArrange.hasEventListener(FINISH, this._endArrangeEventListenerFn)) {
                            this._endArrange.removeEventListener(FINISH, this._endArrangeEventListenerFn);
                        }
                        var repeat = 0;
                        this._endArrangeEventListenerFn = function () {
                            if (!_this2._isPlaying) return;
                            repeat++;
                            //如果完成规定次数则停止
                            if (repeat >= _this2._repeat || _this2._needStop) {
                                _this2._isPlaying = false;
                                //并且移除该事件
                                _this2._endArrange.removeEventListener(FINISH, _this2._endArrangeEventListenerFn);
                                _this2._endArrangeEventListenerFn = undefined;
                                //如果是自然结束
                                if (repeat >= _this2._repeat && !_this2._needStop) {
                                    _this2.dispatchEvent({
                                        type: COMPLETE
                                    });
                                }
                                //如果结束，当前排序是最后排序则触发事件
                                if (_this2._currentArrange === _this2._endArrange) {
                                    _this2._needStop = false;
                                    _this2.dispatchEvent({
                                        type: FINISH
                                    });
                                }
                                //否则再次重头开始
                            } else {
                                _this2._startArrange.start();
                            }
                        };
                        this._endArrange.addEventListener(FINISH, this._endArrangeEventListenerFn);

                        //开始事件
                        if (this._startArrange.hasEventListener(START, this._startArrangeCompleteCallback)) {
                            this._startArrange.removeEventListener(START, this._startArrangeCompleteCallback);
                        }
                        this._startArrangeCompleteCallback = function () {
                            _this2._startArrange.removeEventListener(START, _this2._startArrangeCompleteCallback);
                            _this2._startArrangeCompleteCallback = undefined;
                            _this2.dispatchEvent({
                                type: START
                            });
                        };
                        this._startArrange.addEventListener(START, this._startArrangeCompleteCallback);

                        this._startArrange.start(customSegment);
                    }

                    // pushReverse() {}

                }, {
                    key: "repeat",
                    value: function repeat(_repeat) {
                        if (typeof _repeat !== "number" || _repeat <= 0) throw new Error("Invalid repeat!");
                        this._repeat = _repeat;
                    }
                }, {
                    key: "loop",
                    value: function loop() {
                        this._repeat = Infinity;
                    }
                }, {
                    key: "stop",
                    value: function stop() {
                        var _this3 = this;

                        if (!this._isPlaying) {
                            return false;
                        }

                        if (this._currentArrange instanceof Arrange) {
                            this._needStop = true;
                            //如果当前排序不是最后一个片段，则手动触发结束标志
                            if (this._currentArrange !== this._endArrange) {
                                this._isPlaying = false;
                            }
                            var currentArrange = this._currentArrange;
                            var endArrange = this._endArrange;

                            //如果当前排序不是最后一个片段，则手动触发结束事件
                            if (currentArrange !== endArrange) {
                                this._needStop = false;
                                if (this._currentArrange.hasEventListener(FINISH, this._currentArrangeFinishForStopCallback)) {
                                    this._currentArrange.removeEventListener(FINISH, this._currentArrangeFinishForStopCallback);
                                }
                                this._currentArrangeFinishForStopCallback = function () {
                                    _this3._currentArrange.removeEventListener(FINISH, _this3._currentArrangeFinishForStopCallback);
                                    _this3._currentArrangeFinishForStopCallback = undefined;
                                    _this3.dispatchEvent({
                                        type: FINISH
                                    });
                                };
                                this._currentArrange.addEventListener(FINISH, this._currentArrangeFinishForStopCallback);

                                //并且移除最后
                            }

                            this._currentArrange.stop();
                            this.dispatchEvent({
                                type: STOP
                            });
                        }
                    }
                }, {
                    key: "pause",
                    value: function pause() {
                        var _this4 = this;

                        if (!this._isPlaying || this._isPaused) {
                            return false;
                        }
                        if (this._currentArrange instanceof Arrange) {

                            if (this._currentArrange.hasEventListener(PAUSE, this._currentArrangePauseCallback)) {
                                this._currentArrange.removeEventListener(PAUSE, this._currentArrangePauseCallback);
                            }
                            this._currentArrangePauseCallback = function () {
                                _this4._isPaused = true;
                                _this4._currentArrange.removeEventListener(PAUSE, _this4._currentArrangePauseCallback);
                                _this4._currentArrangePauseCallback = undefined;
                                _this4.dispatchEvent({
                                    type: PAUSE
                                });
                            };
                            this._currentArrange.addEventListener(PAUSE, this._currentArrangePauseCallback);

                            this._currentArrange.pause();
                        }
                    }
                }, {
                    key: "resume",
                    value: function resume() {
                        var _this5 = this;

                        if (!this._isPlaying || !this._isPaused) {
                            return false;
                        }
                        if (this._currentArrange instanceof Arrange) {
                            if (this._currentArrange.hasEventListener(RESUME, this._currentArrangeResumeCallback)) {
                                this._currentArrange.removeEventListener(RESUME, this._currentArrangeResumeCallback);
                            }
                            this._currentArrangeResumeCallback = function () {
                                _this5._isPaused = false;
                                _this5._currentArrange.removeEventListener(RESUME, _this5._currentArrangeResumeCallback);
                                _this5._currentArrangeResumeCallback = undefined;
                                _this5.dispatchEvent({
                                    type: RESUME
                                });
                            };
                            this._currentArrange.addEventListener(RESUME, this._currentArrangeResumeCallback);
                            this._currentArrange.resume();
                        }
                    }
                }, {
                    key: "execute",
                    value: function execute() {
                        var _this6 = this;

                        var arrange = void 0;
                        var segment = void 0;

                        if (arguments.length === 0) {
                            return false;
                        } else if (arguments.length === 1) {
                            segment = arguments.length <= 0 ? undefined : arguments[0];
                        } else {
                            arrange = arguments.length <= 0 ? undefined : arguments[0];
                            segment = arguments.length <= 1 ? undefined : arguments[1];
                        }

                        if (!this._isPlaying || !(segment instanceof Segment) || this._executeing) {
                            return false;
                        }

                        this._executeing = true;

                        var isPaused = this._isPaused;

                        //如果存在_executeForPrevFinishCallback就先移除，有了_switching，可能并不需要但是为了保险
                        if (this.hasEventListener(FINISH, this._executeForPrevFinishCallback)) {
                            this.removeEventListener(FINISH, this._executeForPrevFinishCallback);
                        }
                        this._executeForPrevFinishCallback = function () {
                            //如果是暂停的就切换到对应segment后执行完就暂停
                            if (isPaused) {
                                if (segment.hasEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback)) {
                                    segment.removeEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                                }
                                _this6._executeForTargetSegmentFinishCallback = function () {
                                    _this6.pause();
                                    _this6._executeing = false;
                                    segment.removeEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                                    _this6._executeForTargetSegmentFinishCallback = undefined;
                                };
                                segment.addEventListener(FINISH, _this6._executeForTargetSegmentFinishCallback);
                            } else {
                                _this6._executeing = false;
                            }

                            if (arrange) {
                                _this6.start(arrange, segment);
                            } else {
                                _this6.start(segment);
                            }

                            _this6.removeEventListener(FINISH, _this6._executeForPrevFinishCallback);
                            _this6._executeForPrevFinishCallback = undefined;
                        };
                        this.addEventListener(FINISH, this._executeForPrevFinishCallback);

                        //无论如何先停止
                        this.stop();
                    }
                }, {
                    key: "switch",
                    value: function _switch() {
                        var _this7 = this;

                        var arrange = void 0;
                        var segment = void 0;

                        if (arguments.length === 0) {
                            return false;
                        } else if (arguments.length === 1) {
                            segment = arguments.length <= 0 ? undefined : arguments[0];
                        } else {
                            arrange = arguments.length <= 0 ? undefined : arguments[0];
                            segment = arguments.length <= 1 ? undefined : arguments[1];
                        }

                        if (!this._isPlaying || !(segment instanceof Segment) || this._switching) {
                            return false;
                        }

                        this._switching = true;

                        var isPaused = this._isPaused;

                        //如果存在_switchFinishCallback就先移除，有了_switching，可能并不需要但是为了保险
                        if (this.hasEventListener(FINISH, this._switchForPrevFinishCallback)) {
                            this.removeEventListener(FINISH, this._switchForPrevFinishCallback);
                        }
                        this._switchForPrevFinishCallback = function () {
                            //如果是暂停的就切换到对应arrange 和 segment后就暂停
                            if (isPaused) {
                                if (_this7.hasEventListener(START, _this7._switchForStartAfterCallback)) {
                                    _this7.removeEventListener(START, _this7._switchForStartAfterCallback);
                                }
                                _this7._switchForStartAfterCallback = function () {
                                    _this7.pause();
                                    _this7._switching = false;
                                    _this7.removeEventListener(START, _this7._switchForStartAfterCallback);
                                    _this7._switchForStartAfterCallback = undefined;
                                };
                                _this7.addEventListener(START, _this7._switchForStartAfterCallback);
                            } else {
                                _this7._switching = false;
                            }
                            if (arrange) {
                                _this7.start(arrange, segment);
                            } else {
                                _this7.start(segment);
                            }
                            _this7.removeEventListener(FINISH, _this7._switchForPrevFinishCallback);
                            _this7._switchForPrevFinishCallback = undefined;
                        };
                        this.addEventListener(FINISH, this._switchForPrevFinishCallback);

                        //无论如何先停止
                        this.stop();
                    }
                }]);

                return TimeLine;
            }(EventDispatcher);


            function arrangeEventBind(arrange) {
                var _this8 = this;

                arrange.addEventListener(START, function () {
                    if (!_this8._isPlaying) return;
                    _this8._currentArrange = arrange;
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

            TimeLine$1.update = function () {
                TWEEN.update();
            };
            TimeLine$1.Easing = TWEEN.Easing;

            TimeLine$1.Arrange = Arrange;
            TimeLine$1.Segment = Segment;

            return TimeLine$1;

}));
