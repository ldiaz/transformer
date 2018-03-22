var AspectScript = (function(){

    var weavingEnabled = false;

    function Constructor(){

        var AspectScript = this;
        var undefined;

        AspectScript.BEFORE = -1;
        AspectScript.AROUND = 0;
        AspectScript.AFTER = 1;

        AspectScript.globalObject = (function(){
            return this;
        })();

        // Util
        function emptyFun(){
        }

        function removeFromArray(array, elem){
            for(var i = 0; i < array.length; ++i){
                if(array[i] === elem){
                    array.splice(i, 1);
                    return;
                }
            }
        }

        function ownForEach(obj, callback){
            for(var name in obj){
                if(name !== "__ASPECTS__" && obj.hasOwnProperty(name)){
                    callback(name);
                }
            }
        }

        function error(e){
            throw e;
        }

        var subproto = (function(){
            function F(){
            }

            return function(s){
                F.prototype = s;
                return new F();
            }
        })();

        var EMPTY_ARRAY = [];  //DO NOT RETURN IT to users

        // Tracing (todo: do we really need a proto here?)
        var tracerOn = {
            out: "",
            jp: function(jp){
                //print(jp)
                this.out += "debugInfo.push({k:'jp',level:" + jp.metaLevel + ",toString:'" + jp.toString() + "'});";
            },
            pcFalseByReentrancy: function(aspect, jp){
                this.out += "debugInfo.push({k:'pc',id:" + aspect.id + ",level:" + (jp.metaLevel + 1) + ",returned:false,reason:'reentrance'});";
            },
            pcEval: function(aspect, jp, env){
                var ret = (env ? true : false);
                var reason = (env ? 'env' : 'bool');
                var level = (jp.metaLevel + 1);
                this.out += "debugInfo.push({k:'pc',id:" + aspect.id + ",level:" + level + ",returned:" + ret + ",reason:'" + reason + "'});";
            },
            advEval: function(aspect, jp){
                var level = (jp.metaLevel + 1);
                this.out += "debugInfo.push({k:'adv',id:" + aspect.id + ",level:" + level + "});";
            },
            asps: function(asps, newasps){
                var o = asps.map(function(asp){
                    return asp.id;
                });
                var n = newasps.map(function(asp){
                    return asp.id;
                });
                this.out += "debugInfo.push({k:'aspects',old:[" + o + "],neu:[" + n + "]});";
            },
            proceed: function(jp){
                this.out += "debugInfo.push({k:'proceed',level:" + jp.metaLevel + ",toString:'" + jp.toString() + "'});";
            },
            deploy: function(level){
                this.out += "debugInfo.push({k:'deploy', level:" + level + ",type:'GLOBAL'});";
            },
            enterSS_C: function(jp, asps, newasps){
                var level = jp.metaLevel;
                var o = asps.map(function(asp){
                    return asp.id;
                });
                var n = newasps.map(function(asp){
                    return asp.id;
                });
                this.out += "debugInfo.push({k:'enterss_c', level:" + level + ",old:[" + o + "],neu:[" + n + "]});";
            },
            chainPush: function(chain, elem){
                var o = chain.map(function(elem){
                    return elem[0].id;
                });
                this.out += "debugInfo.push({k:'chain_push',aspects:[" + o + "],aspect:" + elem[0].id + ",jp:'" + elem[1] + "'});";
            },
            chainPop: function(chain){
                var o = chain.map(function(elem){
                    return elem[0].id;
                });
                this.out += "debugInfo.push({k:'chain_pop',aspects:[" + o + "]});";
            },
            pushCtx: function(obj, fun){
                var o = obj.map(function(elem){
                    return elem.id;
                });
                var f = fun.map(function(elem){
                    return elem.id;
                });
                this.out += "debugInfo.push({k:'ctx_push',obj:[" + o + "],fun:[" + f + "]});";
            },
            popCtx: function(obj, fun){
                var o = obj.map(function(elem){
                    return elem.id;
                });
                var f = fun.map(function(elem){
                    return elem.id;
                });
                this.out += "debugInfo.push({k:'ctx_pop',obj:[" + o + "],fun:[" + f + "]});";
            },
            clear: function(){
                this.out = "";
            },
            dump: function(){
                print("var debugInfo = []; " + this.out);
            },
            enable: emptyFun,
            disable: function(){
                tracer = AspectScript.tracer = tracerOff;
            }
        };
        var tracerOff = subproto(tracerOn);
        ownForEach(tracerOn, function(i){
            if(i != "out"){
                tracerOff[i] = emptyFun;
            }
        });
        tracerOff.clear = tracerOn.clear;
        tracerOff.dump = tracerOn.dump;
        tracerOff.enable = function(){
            tracer = AspectScript.tracer = tracerOn;
        };

        var tracer = AspectScript.tracer = tracerOff;

        // JoinPoint kind constants
        var JP_NEW = 0;
        var JP_INIT = 1;
        var JP_CALL = 2;
        var JP_EXEC = 3;
        var JP_PROP_READ = 4;
        var JP_PROP_WRITE = 5;
        var JP_VAR_READ = 6;
        var JP_VAR_WRITE = 7;
        var JP_CUSTOM = 8;

        //global aspect environment
        var aspects = new AE();

        function AE(){
            var aspects = [];

            this.get = function(level){
                growAE(level);
                return aspects[level];
            };

            this.add = function(level, asp){
                growAE(level);
                aspects[level].push(asp);
            };

            this.remove = function(level, asp){
                growAE(level);
                var aspectsInLevel = aspects[level];
                for(var i = 0, n = aspectsInLevel.length; i < n; ++i){
                    if(aspectsInLevel[i] === asp){
                        aspectsInLevel.splice(i, 1);
                        break;
                    }
                }
            };

            this.set = function(level, asps){
                growAE(level);
                aspects[level] = asps;
            };

            this.isEmpty = function(level){
                growAE(level);
                return aspects[level].length == 0;
            };

            function growAE(level){
                for(var i = aspects.length; i <= level; ++i){
                    aspects[i] = [];
                }
            }
        }

        //dd aspects
        //list of dd aspects (on objects/functions)
        var ddAspects = new AspectsMap();

        function AspectsMap(){
            //value can be a single value or an array
            this.put = function(obj, value){
                if(obj.__ASPECTS__ == undefined){
                    obj.__ASPECTS__ = [];
                }

                obj.__ASPECTS__ = obj.__ASPECTS__.concat(value);
            };

            this.remove = function(obj, value){
                if(obj.__ASPECTS__ == undefined){
                    return;
                }

                removeFromArray(obj.__ASPECTS__, value);
            };

            this.aspectsIn = function (obj){
                if(obj.__ASPECTS__ == undefined){
                    return EMPTY_ARRAY;
                }

                return obj.__ASPECTS__;
            };
        }

        //to allow the construction of the parent link
        var currentJoinPoint = null;

        //meta (indicate the level the application is currently executing in)
        var currentMetaLevel = 0;

        //to optimize reentrance checking in isReentering
        var aspectsChain = [];
        aspectsChain.push = function(elem){
            tracer.chainPush(this, elem);
            return Array.prototype.push.call(this, elem);
        };
        aspectsChain.pop = function(){
            tracer.chainPop(this);
            return Array.prototype.pop.call(this);
        };

        // Scoping Strategies
        var ssOn = {
            oldGlobalAspects: [],
            pendingAspects: [],

            enterSS: function(dasps){
                var kind = currentJoinPoint.kind;
                if(kind != JP_CALL && kind != JP_NEW && kind != JP_INIT){ //fix: init?
                    return;
                }

                var newDasps = [], i;

                //c
                if(kind == JP_CALL){
                    AspectScript.up(function up_c(){
                        for(i = 0; i < dasps.length; ++i){
                            if(dasps[i].c === true || (dasps[i].c !== false && dasps[i].c(currentJoinPoint, emptyEnv))){
                                newDasps.push(dasps[i]);
                            }
                        }
                    });

                    this.oldGlobalAspects.push(aspects.get(currentJoinPoint.metaLevel)); //remember global aspects
                    aspects.set(currentJoinPoint.metaLevel, newDasps); //and update them
                    tracer.enterSS_C(currentJoinPoint, dasps, newDasps);
                }
                //d
                else{ // NEW
                    AspectScript.up(function up_d(){
                        for(i = 0; i < dasps.length; ++i){
                            if(dasps[i].d === true || (dasps[i].d !== false && dasps[i].d(currentJoinPoint, emptyEnv))){
                                newDasps.push(dasps[i]);
                            }
                        }
                    });

                    //register aspects to be deployed on the object
                    if(newDasps.length != 0){
                        this.pendingAspects.push([currentJoinPoint, newDasps]);
                    }
                }
            },
            exitSS: function(){
                //todo: optimize this
                if(currentJoinPoint.kind == JP_CALL){
                    var i;
                    //old dynamic aspects in global array
                    var dynamic = this.oldGlobalAspects.pop();
                    for(i = 0; i < dynamic.length; ++i){
                        if(dynamic[i].isGlobal){
                            dynamic.splice(i, 1);
                        }
                    }
                    //new global aspects
                    var global = aspects.get(currentJoinPoint.metaLevel);
                    for(i = 0; i < global.length; ++i){
                        if(!global[i].isGlobal){
                            global.splice(i, 1);
                        }
                    }

                    aspects.set(currentJoinPoint.metaLevel, merge2(global, dynamic));

                    //var m = merge2(this.oldGlobalAspects.pop(), aspects.get(currentJoinPoint.metaLevel));
                    //aspects.set(currentJoinPoint.metaLevel, m);
                }
            },
            handleInit: function(kind, obj, fun){
                //handle pending aspects from "d"
                if(kind == JP_INIT){
                    var length = this.pendingAspects.length;
                    if(length > 0){
                        var pair = this.pendingAspects[length - 1]; //[jp, asps]
                        if(pair[0].fun === fun){
                            ddAspects.put(obj, pair[1]);
                            this.pendingAspects.pop(); //done with this pair
                        }
                    }
                }
            }
        };
        var ssOff = {
            enterSS: emptyFun,
            exitSS: emptyFun,
            handleInit: emptyFun
        };
        var scopingStrategies = ssOff;

        // Weaving
        function weave(jp){
            //console.log(jp)
            tracer.jp(jp);
            currentJoinPoint = jp;

            var ss = scopingStrategies; //we must use the same object for enterSS and exitSS
            try{
                var dasps = u();
                ss.enterSS(dasps);

                //tracer.asps(asd, []);
                var weavingNeeded = dasps.length > 0 && weavingEnabled;
                if(!weavingNeeded){
                    tracer.proceed(jp);
                    return jp._proceed();
                }

                var finalAspects = filter(currentJoinPoint, dasps);
                if(finalAspects.length == 0){
                    return currentJoinPoint._proceed();
                }
                else{
                    return currentJoinPoint.chain(finalAspects);
                }
            }
            finally{
                ss.exitSS();
                currentJoinPoint = jpPool.release(currentJoinPoint).parentAllLevel;
            }
        }

        var currentContext = [
            AspectScript.globalObject,
            function(){
            }
        ];

        function weaveWithCtx(kind, obj, args, wrapper, fun, parent){
            var oldContext = currentContext;
            currentContext = [obj, wrapper];

            try{
                scopingStrategies.handleInit(kind, obj, wrapper);
                if(!weavingNeeded()){
                    return fun.apply(obj, args);
                }

                return weave(jpPool.get(kind, obj, args, wrapper, fun, parent));
            }
            finally{
                currentContext = oldContext;
            }
        }

        function filter(jp, aspects){
            var matchresult = [], mask;

            for(var i = 0, n = aspects.length; i < n; ++i){
                var aspect = aspects[i];

                //-- f mask--
                var f = aspect.f;
                mask = f.kindMask;
                if(mask != undefined && (mask & (1 << jp.kind)) != 0){
                    continue;
                }

                //-- pc mask --
                mask = (aspect.original).pointcut.kindMask;
                if(mask != undefined && (mask & (1 << jp.kind)) != 0){
                    continue;
                }

                matchresult.push(aspect);
            }

            return matchresult;
        }

        function executePointcut(aspect, jp, env){
            if(isReentering(jp, aspect)){
                tracer.pcFalseByReentrancy(aspect, jp);
                return false;
            }

            //todo: does f pertain to the aspect?
            var f = aspect.f;
            var ret = f === true || (f !== false && f(jp, emptyEnv));
            if(!ret){
                return false;
            }

            aspectsChain.push([aspect, jp]);
            var newEnv;
            try{
                newEnv = (aspect.original).pointcut(jp, env);
            }
            finally{
                aspectsChain.pop();
            }

            tracer.pcEval(aspect, jp, newEnv);

            if(newEnv && emptyEnv.isPrototypeOf(newEnv)){
                return newEnv;
            }

            //return-value normalization: env or boolean
            //if the value is "only" true, we preserve the previous environment
            if(newEnv){
                if(env){
                    return env;
                }
                else{
                    throw "lost env";
                }
            }
            else{
                return false;
            }
        }

        // Union
        function weavingNeeded(){
            return aspects.get(currentMetaLevel + 1).length > 0 ||
                   ddAspects.aspectsIn(currentContext[0]).length > 0 ||
                   ddAspects.aspectsIn(currentContext[1]).length > 0;
        }

        function u(){
            var globalAE = aspects.get(currentMetaLevel + 1); //aspects.get(currentJoinPoint.metaLevel);
            var objAspects = ddAspects.aspectsIn(currentContext[0]);
            var funAspects = ddAspects.aspectsIn(currentContext[1]);

            if(globalAE.length + objAspects.length + funAspects.length == 0){
                return [];
            }

            //concat all
            return merge3(globalAE, funAspects, objAspects);
        }

        function merge2(a, b){
            var res = [];

            var na = a.length;
            var nb = b.length;
            var x = 0, y = 0;
            while(x < na && y < nb){
                if(a[x].id < b[y].d){
                    res.push(a[x++]);
                }
                else{
                    res.push(b[y++]);
                }
            }

            while(x < na){
                res.push(a[x++]);
            }
            while(y < nb){
                res.push(b[y++]);
            }

            return res;
        }

        function _merge2(oldGlobal, curGlobal){
            var all = [];
            var i;

            //keep only dynamic aspects from the OLD array
            for(i = oldGlobal.length; i--;){
                if(!oldGlobal[i].isGlobal){
                    all[oldGlobal[i].id - 1] = oldGlobal[i];
                }
            }
            //keep only global aspects from the NEW array
            for(i = curGlobal.length; i--;){
                if(curGlobal[i].isGlobal){
                    all[curGlobal[i].id - 1] = curGlobal[i];
                }
            }

            //optimize tipical case: only one aspect
            if(all.length <= 1){
                return all;
            }

            var res = [];
            var n = all.length;
            for(i = 0; i < n; ++i){
                var v = all[i];
                if(v !== undefined){
                    res.push(v);
                }
            }

            return res;
        }

        function merge3(a, b, c){
            var all = [];
            var i;

            for(i = a.length; i--;){
                all[a[i].id - 1] = a[i];
            }

            for(i = b.length; i--;){
                all[b[i].id - 1] = b[i];
            }

            for(i = c.length; i--;){
                all[c[i].id - 1] = c[i];
            }

            //optimize tipical case: only one aspect
            if(all.length <= 1){
                return all;
            }

            var res = [];
            var n = all.length;
            for(i = 0; i < n; ++i){
                var v = all[i];
                if(v !== undefined){
                    res.push(v);
                }
            }

            return res;
        }

        // Environments
        var emptyEnv = this.emptyEnv = {
            bind : function(name, value){
                var env = subproto(this);
                env[name] = value;
                return env;
            },
            unbind : function(name){
                var env = subproto(this);
                env[name] = undefined;
                return env;
            },
            toString : function(){
                var str = "";
                for(var n in this){
                    if(n == "bind" || n == "unbind" || n == "toString"){
                        continue;
                    }
                    str += (n + "=" + this[n] + "\n");
                }
                if(str == ""){
                    str += "[empty]";
                }

                return str;
            }
        };

        // Join Points
        var jpPool = new JPPool();

        //disable this if it is necessary to save references to past jps
        var ENABLE_JP_POOL = true;

        function JPPool(){
            var constructors = [];
            constructors[JP_NEW] = NewJoinPoint;
            constructors[JP_INIT] = InitJoinPoint;
            constructors[JP_CALL] = CallJoinPoint;
            constructors[JP_EXEC] = ExecJoinPoint;
            constructors[JP_PROP_READ] = PropertyReadJoinPoint;
            constructors[JP_PROP_WRITE] = PropertyWriteJoinPoint;
            constructors[JP_VAR_READ] = VarReadJoinPoint;
            constructors[JP_VAR_WRITE] = VarWriteJoinPoint;
            constructors[JP_CUSTOM] = CustomJoinPoint;

            var pool = [];
            for(var i = 0; i < constructors.length; ++i){
                pool[i] = [];

                //check whether the optimization in "get" will work
                if(constructors[i].length > 6){
                    throw "'get' optimization will not work";
                }
            }

            this.get = function(kind){
                var jp;
                if(ENABLE_JP_POOL && pool[kind].length != 0){
                    jp = pool[kind].pop();
                    //this is TWICE as fast as "jp.reinit.apply(inner, arguments);". MAX 6 params (see "for" above)
                    jp.reinit(arguments[0], arguments[1], arguments[2],
                              arguments[3], arguments[4], arguments[5]);
                }
                else{
                    jp = subproto(protoJP);
                    constructors[kind].apply(jp, arguments);
                }

                return jp;
            };

            this.release = function(jp){
                pool[jp.kind].push(jp);
                return jp;
            };
        }

        var protoJP = {
            _reinit: function(_kind, _parent){
                this.kind = _kind;
                this.parentAllLevel = _parent;
                this.metaLevel = currentMetaLevel + 1;
                this.finalResult = null;
                //chain //todo: prevent access to these instances in acChecker
                this.aspectIdx = 0;
                this.aspects = null;
                this.baseCtx = null;
            },

            chain: function(aspects){
                this.aspectIdx = 0;
                this.aspects = aspects;
                var jp = this;

                return AspectScript.up(function adv_up_around(){
                    return jp.proceed();
                });
            },

            proceed: function(){
                var jp = this;

                //no more aspects => original computation
                if(this.aspectIdx == this.aspects.length){
                    var args = arguments;
                    return AspectScript.down(function(){
                        //restore original context
                        var oldContext = currentContext;
                        currentContext = jp.baseCtx;

                        var previousPair = (aspectsChain.length > 0 &&
                                            aspectsChain[aspectsChain.length - 1][1] === jp) ?
                                           aspectsChain.pop() : null; //todo
                        try{
                            tracer.proceed(jp);
                            return jp._proceed.apply(jp, args); //jp._proceed(arg1, arg2,...)
                        }
                        finally{
                            //restore old context
                            currentContext = oldContext;

                            if(previousPair != null){
                                aspectsChain.push(previousPair);
                            }
                        }
                    });
                }

                if(this.aspectIdx == 0){ //remember original context (for last proceed)
                    this.baseCtx = currentContext;
                }

                //aspect to execute
                var aspect = this.aspects[this.aspects.length - this.aspectIdx - 1];
                ++this.aspectIdx;

                //remove only if the pair belongs to the same chain
                var previousPair = (aspectsChain.length > 0 && aspectsChain[aspectsChain.length - 1][1] === jp) ?
                                   aspectsChain.pop() : null;
                aspectsChain.push([aspect, jp]);
                try{
                    tracer.advEval(aspect, jp);

                    //advice evaluation
                    if(aspect.kind === AspectScript.BEFORE){
                        var env = executePointcut(aspect, jp, emptyEnv);
                        if(env){
                            (aspect.original).advice(jp, env);
                        }
                        return jp.proceed();
                    }
                    if(aspect.kind === AspectScript.AROUND){
                        var env = executePointcut(aspect, jp, emptyEnv);
                        if(env){
                            return (aspect.original).advice(jp, env);
                        }
                        return jp.proceed();
                    }
                    if(aspect.kind === AspectScript.AFTER){
                        try{
                            return (jp.finalResult = jp.proceed());  //update finalResult for after advices
                        }
                        finally{
                            var env = executePointcut(aspect, jp, emptyEnv);
                            if(env){
                                (aspect.original).advice(jp, env);
                            }
                        }
                    }
                }
                finally{
                    aspectsChain.pop();
                    if(previousPair != null){
                        aspectsChain.push(previousPair);
                    }
                    --this.aspectIdx;
                }
            },

            get parent(){
                var parent = this.parentAllLevel;
                while(parent !== null && parent.metaLevel !== this.metaLevel){
                    parent = parent.parentAllLevel;
                }
                return parent;
            },

            copyFrom: function(jp){
                this.metaLevel = jp.metaLevel;
                this.finalResult = jp.finalResult;
                this.aspectIdx = jp.aspectIdx;
                this.aspects = jp.aspects;
                this.baseCtx = jp.baseCtx;
            },

            toString: function(){
                var strs = [];
                strs[JP_NEW] = "new";
                strs[JP_INIT] = "init";
                strs[JP_CALL] = "call";
                strs[JP_EXEC] = "exec";
                strs[JP_VAR_READ] = "vr";
                strs[JP_VAR_WRITE] = "vw";
                strs[JP_PROP_READ] = "pr";
                strs[JP_PROP_WRITE] = "pw";
                strs[JP_CUSTOM] = "custom";
                return "[" + strs[this.kind] + "]";
            },

            //is*
            isNew: jpGetter(JP_NEW),
            isInit: jpGetter(JP_INIT),
            isCall: jpGetter(JP_CALL),
            isExec: jpGetter(JP_EXEC),
            isPropRead: jpGetter(JP_PROP_READ),
            isPropWrite: jpGetter(JP_PROP_WRITE),
            isVarRead: jpGetter(JP_VAR_READ),
            isVarWrite: jpGetter(JP_VAR_WRITE),
            isCustom: function(name){
                return this.kind == JP_CUSTOM && this.name === name;
            }
        };

        function jpGetter(kind){
            return function(){
                return this.kind == kind;
            }
        }

        function NewJoinPoint(_kind, _thunk, _fun, _args, _parent){
            //private
            var thunk;
            var args;

            this.reinit = function(_kind, _thunk, _fun, _args, _parent){
                this._reinit(_kind, _parent);
                thunk = _thunk;
                this.fun = _fun;
                args = _args;
            };

            this.reinit(_kind, _thunk, _fun, _args, _parent);

            this.__defineGetter__("args", function(){
                return Array.prototype.slice.call(args);
            });

            this._proceed = function(){
                var actualArgs = (arguments.length == 0) ? args : arguments;
                return thunk.apply(null, [this.fun].concat(actualArgs)); //call the thunk
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, thunk, this.fun, args, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };
        }

        function InitJoinPoint(_kind, _target, _args, _wrapper, _constructor, _parent){
            //private
            var args;
            var fun;

            this.reinit = function(_kind, _target, _args, _wrapper, _constructor, _parent){
                this._reinit(_kind, _parent);
                this.target = _target;
                args = _args;
                fun = _constructor;
                this.fun = _wrapper;
            };

            this.reinit(_kind, _target, _args, _wrapper, _constructor, _parent);

            this.__defineGetter__("args", function(){
                return Array.prototype.slice.call(args);
            });

            this._proceed = function(){
                var actualArgs = (arguments.length == 0) ? args : arguments;
                return fun.apply(this.target, actualArgs);
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.target, args, this.fun, fun, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };
        }

        function CallJoinPoint(_kind, _target, _fun, _args, _context, _parent){
            //private
            var args;
            var methods;

            this.reinit = function(_kind, _target, _fun, _args, _context, _parent){
                this._reinit(_kind, _parent);
                this.target = _target;
                this.fun = _fun;
                this.context = _context;
                args = _args;
                methods = null;
                this.reflective = false;

                //reflective?
                if(this.target instanceof Function){
                    //fun.call(obj, arg1, arg2...)
                    if(this.fun === Function.prototype.call){
                        this.fun = this.target;
                        this.target = args[0] != null ? args[0] : AspectScript.globalObject;  //target is args[0]
                        args.splice(0, 1); //remove target from the args
                        this.reflective = true;
                    }
                    //fun.apply(obj, [arg1, arg2...])
                    if(this.fun === Function.prototype.apply){
                        this.fun = this.target;
                        this.target = args[0] != null ? args[0] : AspectScript.globalObject;  //target is args[0]
                        args = args[1]; //args is args[1]
                        this.reflective = true;
                    }
                }
            };

            this.reinit(_kind, _target, _fun, _args, _context, _parent);

            this.__defineGetter__("args", function(){
                return Array.prototype.slice.call(args);
            });

            this.__defineGetter__("methods", function(){
                return (methods == null) ?
                       methods = findNamesOf(this.fun, this.target) :
                       Array.prototype.slice.call(methods); //clone methods array
            });

            this._proceed = function(){
                var actualArgs = (arguments.length == 0) ? args : arguments;
                return this.fun.apply(this.target, actualArgs);
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.target, this.fun, args, this.context, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };

            this.toString = function(){
                return "[call: " + this.methods + "]"; //this.methods forces calculation of methods
            };
        }

        function ExecJoinPoint(_kind, _target, _args, _wrapperFun, _originalFun, _parent){
            //private
            var args;
            var originalFun;
            var methods;

            this.reinit = function(_kind, _target, _args, _wrapperFun, _originalFun, _parent){
                this._reinit(_kind, _parent);
                this.target = _target;
                args = _args;
                this.fun = _wrapperFun;
                originalFun = _originalFun;
                methods = null;
            };

            this.reinit(_kind, _target, _args, _wrapperFun, _originalFun, _parent);

            this.__defineGetter__("args", function(){
                return Array.prototype.slice.call(args);
            });

            this.__defineGetter__("methods", function(){
                return (methods == null) ?
                       methods = findNamesOf(this.fun, this.target) :
                       Array.prototype.slice.call(methods); //clone methods array
            });

            this._proceed = function(){
                var actualArgs = (arguments.length == 0) ? args : arguments;
                return originalFun.apply(this.target, actualArgs);
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.target, args, this.fun, originalFun, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };

            this.toString = function(){
                return "[exec: " + this.methods + "]"; //this.methods forces calculation of methods
            };
        }

        function PropertyReadJoinPoint(_kind, _target, _name, _parent){
            this.reinit = function(_kind, _target, _name, _parent){
                this._reinit(_kind, _parent);
                this.target = _target;
                this.name = _name;
            };

            this.reinit(_kind, _target, _name, _parent);

            this._proceed = function(){
                return (arguments.length == 0) ? this.target[this.name] : arguments[0];
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.target, this.name, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };

            this.toString = function(){
                return "[pr: " + this.name + "]";
            };
        }

        function PropertyWriteJoinPoint(_kind, _target, _name, _value, _parent){
            this.reinit = function(_kind, _target, _name, _value, _parent){
                this._reinit(_kind, _parent);
                this.target = _target;
                this.name = _name;
                this.value = _value;
            };

            this.reinit(_kind, _target, _name, _value, _parent);

            this._proceed = function(){
                return this.target[this.name] = ((arguments.length == 0) ? this.value : arguments[0]);
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.target, this.name, this.value, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };

            this.toString = function(){
                return "[pw: " + this.name + "]";
            };
        }

        function VarReadJoinPoint(_kind, _name, _value, _parent){
            this.reinit = function(_kind, _name, _value, _parent){
                this._reinit(_kind, _parent);
                this.name = _name;
                this.value = _value;
            };

            this.reinit(_kind, _name, _value, _parent);

            this._proceed = function(){
                return (arguments.length == 0) ? this.value : arguments[0];
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.name, this.value, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };

            this.toString = function(){
                return "[vr: " + this.name + "]";
            };
        }

        function VarWriteJoinPoint(_kind, _name, _value, _oldValue, _parent){
            this.reinit = function(_kind, _name, _value, _oldValue, _parent){
                this._reinit(_kind, _parent);
                this.name = _name;
                this.value = _value;
                this.oldValue = _oldValue;
            };

            this.reinit(_kind, _name, _value, _oldValue, _parent);

            this._proceed = function(){
                return (arguments.length == 0) ? this.value : arguments[0];
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.name, this.value, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };
        }

        //todo: how to change contextual info?
        //todo: what happens in the interaction of the pool and custom properties?
        function CustomJoinPoint(_kind, _name, _vars, _proceed, _parent){
            //private
            var proceed;
            var vars;

            this.reinit = function(_kind, _name, _vars, _proceed, _parent){
                this._reinit(_kind, _parent);
                this.name = _name;

                vars = _vars;
                var thiz = this;
                ownForEach(_vars, function(i){
                    thiz[i] = _vars[i];
                });

                proceed = _proceed;
            };

            this.reinit(_kind, _name, _vars, _proceed, _parent);

            this._proceed = function(){
                return proceed();
            };

            this.clone = function(){
                var r = jpPool.get(this.kind, this.name, vars, proceed, this.parentAllLevel);
                r.copyFrom(this);
                return r;
            };
        }

        function findNamesOf(fun, obj){
            var methods = [];
            for(var name in obj){
                //console.log("n: " + name);
                try{
                    if(obj[name] === fun){
                        methods.push(name);
                    }
                }
                catch(e){
                    //1.  domConfig
                    //console.log("conflictive name: " + name);
                }
            }
            return methods;
        }

        var DEPLOYED_ASPECTS_IDS = 1;

        function wrapAspect(aspect, global, ss){
            return {
                id: DEPLOYED_ASPECTS_IDS++,
                original: aspect,
                kind : aspect.kind,
                isGlobal: global,
                c: ss[0],
                d: ss[1],
                f: ss[2]
                //ctx: aspect.ctx
            };
        }

        // ---- API for Aspects (Public)  ----

        this.aspect = function(aspKind, pc, adv, ctx){
            return {
                kind: aspKind,
                pointcut: pc,
                advice: adv,
                //ctx: (ctx != undefined) ? ctx : false
                ctx: ctx
            };
        };

        this.before = function(pc, adv){
            return this.deploy(this.aspect(this.BEFORE, pc, adv, arguments[2]));
        };

        this.around = function(pc, adv){
            return this.deploy(this.aspect(this.AROUND, pc, adv, arguments[2]));
        };

        this.after = function(pc, adv){
            return this.deploy(this.aspect(this.AFTER, pc, adv, arguments[2]));
        };

        this.deploy = function(){
            tracer.deploy(currentMetaLevel + 1);
            var ss, aspect, fun;

            //global deployment
            if(arguments.length == 1){
                aspect = arguments[0];
                ss = [true, false, true];
                aspects.add(currentMetaLevel + 1, wrapAspect(aspect, true, ss));
                return aspect;
            }
            //dynamic deployment
            else{
                //ss parameter is optional
                var start;
                if(arguments.length == 2){
                    ss = [true, false, true];
                    start = 0;
                }
                else if(arguments.length == 3){
                        ss = arguments[0];
                        start = 1;
                        scopingStrategies = ssOn; //optimization
                    }
                    else{
                        throw "Wrong number of arguments";
                    }

                aspect = arguments[start++];
                fun = arguments[start++];

                aspect = wrapAspect(aspect, false, ss);
                aspects.add(currentMetaLevel + 1, aspect); //deploy
                try{
                    return fun();  //in the case of dd aspects, the user does not get a reference to the aspect
                }
                finally{
                    //undeploy
                    aspects.remove(currentMetaLevel + 1, aspect);
                }
            }
        };

        //todo: update aspectsWithSS
        /*this.undeploy = function(aspect, obj){
         removeFromArray(aspect.metaLevels, currentMetaLevel + 1);

         //only aspect => global aspect
         if(arguments.length == 1){
         //static
         removeFromArray(aspects, aspect);
         //dd
         //ddAspects.removeAll(aspect); //??
         }
         //aspect and object
         else{
         ddAspects.remove(obj, aspect);
         }
         };*/

        this.deployOn = function(){
            var ss, aspect, obj;

            //ss parameter is optional
            var start = 0;
            if(arguments.length == 2){
                ss = [false, false, true];
                start = 0;
            }
            else if(arguments.length == 3){
                    ss = arguments[0];
                    start = 1;
                    scopingStrategies = ssOn; //optimization
                }
                else{
                    throw "Wrong number of arguments";
                }

            aspect = arguments[start++];
            obj = arguments[start++];

            ddAspects.put(obj, wrapAspect(aspect, false, ss));
            return aspect;
        };

        //---- Instrumentation (i13n) (PUBLIC) ----

        //objects whose methods invocations should not be intercepted
        this.registerSystemObject = function(obj){
            systemObjects.push(obj);
        };

        var systemObjects = [
            this,
            this.Pointcuts
        ];

        this.jpModel = {
            varRead: true,
            varWrite: true
        };

        var thunks = [
            function(ktor){
                return new ktor();
            },
            function(ktor, a){
                return new ktor(a);
            },
            function(ktor, a, b){
                return new ktor(a, b);
            },
            function(ktor, a, b, c){
                return new ktor(a, b, c);
            },
            function(ktor, a, b, c, d){
                return new ktor(a, b, c, d);
            },
            function(ktor, a, b, c, d, e){
                return new ktor(a, b, c, d, e);
            },
            function(ktor, a, b, c, d, e, f){
                return new ktor(a, b, c, d, e, f);
            },
            function(ktor, a, b, c, d, e, f, g){
                return new ktor(a, b, c, d, e, f, g);
            },
            function(ktor, a, b, c, d, e, f, g, h){
                return new ktor(a, b, c, d, e, f, g, h);
            },
            function(ktor, a, b, c, d, e, f, g, h, i){
                return new ktor(a, b, c, d, e, f, g, h, i);
            },
            function(ktor, a, b, c, d, e, f, g, h, i, j){
                return new ktor(a, b, c, d, e, f, g, h, i, j);
            },
            function(ktor, a, b, c, d, e, f, g, h, i, j, k){
                return new ktor(a, b, c, d, e, f, g, h, i, j, k);
            },
            function(ktor, a, b, c, d, e, f, g, h, i, j, k, l){
                return new ktor(a, b, c, d, e, f, g, h, i, j, k, l);
            }
        ];

        this.i13n = {
            wrap: function (thunk){
                var wrapper = function(){
                    //the first time, we resolve the original fun (we use the thunk pattern to delay evaluation)
                    if(thunk.wrapper === undefined){
                        //we complete the creation of "this" in the initialization of functions
                        //a function has a wrapper *and* a thunk, the proxy and the real object
                        try{
                            thunk = thunk.apply(null, arguments);
                        }
                        catch(e){
                            throw "cannot happen: thunk (" + e.toString() + ")"; //cannot happen
                        }
                        //update the relationship between wrapper and thunk
                        thunk.wrapper = wrapper;

                        //todo: copy the "standard" properties of the thunk
                        //wrapper.length = thunk.length;

                        //now we are ready signal the "init" of the function (with an *empty* initialization)
                        weaveWithCtx(JP_INIT, wrapper, [], Function, emptyFun, currentJoinPoint);

                        return wrapper;
                    }

                    var isConstructor = (this.constructor === wrapper); //safe at this level
                    if(isConstructor){
                        //don't return the value (which is "undefined" anyway)
                        weaveWithCtx(JP_INIT, this, arguments, wrapper, thunk, currentJoinPoint);
                    }
                    else{
                        return weaveWithCtx(JP_EXEC, this, arguments, wrapper, thunk, currentJoinPoint);
                    }
                };

                if(!weavingNeeded()){
                    return wrapper();
                }
                //function declaration (<==> creation)
                return weave(jpPool.get(JP_NEW, wrapper, Function, [], currentJoinPoint));
            },

            creation: function (thunk, constructor, args){
                thunk = thunks[thunk] || error("too few thunks: " + thunk);

                if(constructor === Function){
                    var oldThunk = thunk;
                    thunk = function(){
                        return oldThunk.call(null, Function, args); //new Function(args) <- args == fun body
                    };
                    return this.wrap(thunk);
                }

                if(!weavingNeeded()){
                    return thunk.apply(null, [constructor].concat(args));
                }
                return weave(jpPool.get(JP_NEW, thunk, constructor, args, currentJoinPoint));
            },

            //literal object creation
            creation2: function (initializer, ctx, _arguments){
                var thunk = function(){
                    var obj = {};  //SPEC: 11.1.5
                    //we have to use the context in which the object is being created
                    //(it has been changed with the creation of thunk)
                    var init = function(){
                        initializer.call(ctx, obj, _arguments);
                    };
                    weaveWithCtx(JP_INIT, obj, [], Object, init, currentJoinPoint); //ignore result
                    return obj;
                };

                if(!weavingNeeded()){
                    return thunk();
                }
                return weave(jpPool.get(JP_NEW, thunk, Object, [], currentJoinPoint));
            },

            // "{}" case, it is an optimization as we don't need initializer, ctx and arguments
            creation3: function (){
                var thunk = function(){
                    var obj = {}; //SPEC: 11.1.5
                    weaveWithCtx(JP_INIT, obj, [], Object, emptyFun, currentJoinPoint); //ignore result
                    return obj;
                };

                if(!weavingNeeded()){
                    return thunk();
                }
                return weave(jpPool.get(JP_NEW, thunk, Object, [], currentJoinPoint));
            },

            //literal array creation
            creation4: function(args){
                var thunk = function(K, actualArgs){ //constructor K is useless
                    var array = Array.prototype.slice.call(actualArgs); //clone the args
                    weaveWithCtx(JP_INIT, array, actualArgs, Array, emptyFun, currentJoinPoint); //ignore result
                    return array;
                };

                if(!weavingNeeded()){
                    return thunk(null, args);
                }
                //[args] is a consequence of the implementation of the new jp
                return weave(jpPool.get(JP_NEW, thunk, Array, [args], currentJoinPoint));
            },

            call: function (obj, fun, args, context){
                acChecker.checkCall(obj, fun);

                if(!weavingNeeded()){
                    return fun.apply(obj, args);
                }

                var call = jpPool.get(JP_CALL, obj, fun, args, context, currentJoinPoint);
                if(systemObjects.indexOf(obj) >= 0){
                    try{
                        return call._proceed();
                    }
                    finally{
                        jpPool.release(call);
                    }
                }

                return weave(call);
            },

            //alternative case when obj IS specified (obj.m)
            call2: function(obj, funName, args, context){
                acChecker.checkCall(obj, obj[funName]);

                if(!weavingNeeded()){
                    return obj[funName].apply(obj, args);
                }

                var call = jpPool.get(JP_CALL, obj, this.propRead(obj, funName), args, context, currentJoinPoint);
                if(systemObjects.indexOf(obj) >= 0){
                    try{
                        return call._proceed();
                    }
                    finally{
                        jpPool.release(call);
                    }
                }

                return weave(call);
            },

            propRead: function(obj, name){
                if(!weavingNeeded()){
                    return obj[name];
                }
                return weave(jpPool.get(JP_PROP_READ, obj, name, currentJoinPoint));
            },

            propWrite: function (obj, name, value){
                acChecker.checkPW(obj, name);

                if(!weavingNeeded()){
                    return (obj[name] = value);
                }
                return weave(jpPool.get(JP_PROP_WRITE, obj, name, value, currentJoinPoint));
            },

            varRead: function(name, value){
                if(!AspectScript.jpModel.varRead){
                    return value;
                }

                return weave(jpPool.get(JP_VAR_READ, name, value, currentJoinPoint));
            },

            varWrite: function(name, value, oldValue){
                if(!AspectScript.jpModel.varWrite){
                    return value;
                }

                return weave(jpPool.get(JP_VAR_WRITE, name, value, oldValue, currentJoinPoint));
            },

            propIncr : function(obj, prop, incr, postfix){
                var value = this.propWrite(obj, prop, this.propRead(obj, prop) + incr);
                return postfix ? value - incr : value;
            }
        };

        //---- Reentrance (PRIVATE) ----

        function isReentering(jp, aspect){
            var ctx = aspect.original.ctx;
            ctx = (ctx != undefined) ? ctx : false;

            if(ctx === true){
                return false;
            }

            var DEBUG = false;
            var ctxJP = ctx !== false ? ctx(jp) : false; //jp is JP in pc(JP), not a pc_exec in the case of nested pointcuts
            for(var i = 0; i < aspectsChain.length - 1; ++i){ //-1: skip last aspect (optimization of executePointcut)
                //aspectsChain[i] = [aspect, jp]
                var aux = aspectsChain[i][0];
                var jp2 = aspectsChain[i][1];

                if(aspect.original === aux.original && (ctx === false || ctxJP === ctx(jp2))){
                    if(DEBUG){
                        print("ar");
                    }
                    return true;
                }
            }

            return false;
        }

        //---- API for Fluent Interface (PUBLIC) ----

        this.applyFluentInterface = function(fun){
            var pointcutsFluentInterface = {
                and: function(right){
                    var left = this;
                    return wrapPointcut(function(jp, env){
                        var newEnv = left.call(this, jp, env);
                        if(!newEnv){
                            return false;
                        }
                        return right.call(this, jp, newEnv);
                    });
                },
                or: function(right){
                    var left = this;
                    return wrapPointcut(function(jp, env){
                        var newEnv = left.call(this, jp, env);
                        if(!newEnv){
                            return right.call(this, jp, env);
                        }
                        return newEnv;
                    });
                },
                inCFlowOf: function(pc){
                    return this.and(AspectScript.Pointcuts.cflow(pc));
                }
            };
            ownForEach(pointcutsFluentInterface, function(methodName){
                if(!fun[methodName]){
                    fun[methodName] = pointcutsFluentInterface[methodName];
                }
            });
            return fun;
        };

        function wrapPointcut(pcFun){
            var wrap = AspectScript.i13n.wrap(function(){
                return function (jp, env){
                    var newEnv = pcFun.call(this, jp, env);
                    if(newEnv && emptyEnv.isPrototypeOf(newEnv)){
                        return newEnv;
                    }
                    return (newEnv) ? (env ? env : true) : false;
                };
            });

            return AspectScript.applyFluentInterface(wrap);
        }

        function optKind(k1){
            if(arguments.length == 1){
                return function(jp){
                    if(jp.kind !== k1){
                        return AspectScript.Pointcuts.NO_KIND;
                    }
                }
            }
            if(arguments.length == 2){
                var k2 = arguments[1];
                return function(jp){
                    if(jp.kind !== k1 && jp.kind !== k2){
                        return AspectScript.Pointcuts.NO_KIND;
                    }
                }
            }
            throw "invalid number of arguments";
        }

        var Pointcuts = this.Pointcuts = {
            within:function(target){
                return wrapPointcut(function (jp){
                    //return jp.parent != null && this.cflow(pc)(jp.parent);
                    if((jp = jp.parent) == null){
                        return false;
                    }
                    do{
                        if(jp.target === target){
                            return true;
                        }

                        jp = jp.parent;
                    } while(jp != null && (jp.kind != JP_INIT || jp.kind != JP_EXEC)); //fix: is this "||" OK?

                    return false;
                });
            },

            get: function(target, name){
                // if target is "*" (match all reads)
                if(arguments.length == 1 && target === "*"){
                    return Pointcuts.opt(optKind(JP_VAR_READ, JP_PROP_READ), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                // by name only (var read)
                else if(arguments.length == 1){
                        name = target;
                        return Pointcuts.opt(optKind(JP_VAR_READ), function(jp){
                            return jp.name === name;
                        });
                    }
                    else{
                        // by name and target (prop read)
                        return Pointcuts.opt(optKind(JP_PROP_READ), function(jp){
                            return (jp.target === target || target === "*") &&
                                   (jp.name === name || name === "*");
                        });
                    }
            },

            //vars by name and props by (object, name)
            set: function(target, name){
                if(arguments.length == 1 && target === "*"){
                    return Pointcuts.opt(optKind(JP_VAR_WRITE, JP_PROP_WRITE), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                // by name only (var write)
                else if(arguments.length == 1){
                        name = target;
                        return Pointcuts.opt(optKind(JP_VAR_WRITE), function(jp){
                            return jp.name === name;
                        });
                    }
                    else{
                        // by name and target (prop write)
                        return Pointcuts.opt(optKind(JP_PROP_WRITE), function(jp){
                            return (jp.target === target || target === "*") &&
                                   (jp.name === name || name === "*");
                        });
                    }
            },

            creation: function(fun){
                // if fun is "*" (match all calls)
                if(fun === "*"){
                    return Pointcuts.opt(optKind(JP_NEW), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                //only by ref
                return Pointcuts.opt(optKind(JP_NEW), function(jp){
                    return jp.fun === fun;
                });
            },

            init: function(fun){
                if(fun === "*"){
                    return Pointcuts.opt(optKind(JP_INIT), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                //only by ref
                return Pointcuts.opt(optKind(JP_INIT), function(jp){
                    return jp.fun === fun;
                });
            },

            call: function(arg){
                // if arg is "*" (match all calls)
                if(arg === "*"){
                    return Pointcuts.opt(optKind(JP_CALL), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                //by name
                if(typeof arg == "string"){
                    return Pointcuts.opt(optKind(JP_CALL), function(jp){
                        return jp.methods.indexOf(arg) >= 0;
                    });
                }
                //by ref
                else{
                    return Pointcuts.opt(optKind(JP_CALL), function(jp){
                        return jp.fun === arg;
                    });
                }
            },

            exec: function(arg){
                // if arg is "*" (match all execs)
                if(arg === "*"){
                    return Pointcuts.opt(optKind(JP_EXEC), function(){
                        return true; //optKind(..) already filtered the jp!
                    });
                }
                //by name
                if(typeof arg == "string"){
                    return Pointcuts.opt(optKind(JP_EXEC), function(jp){
                        return jp.methods.indexOf(arg) >= 0;
                    });
                }
                //by ref
                else{
                    return Pointcuts.opt(optKind(JP_EXEC), function(jp){
                        return jp.fun === arg;
                    });
                }
            },

            target: function (obj){
                return wrapPointcut(function(jp){
                    if(obj === "*" && jp.target !== undefined){
                        return true;
                    }
                    return jp.target === obj;
                });
            },

            cflow: function (pc){
                return wrapPointcut(function (jp, env){
                    //return pc(jp) || this.cflowbelow(pc)(jp);
                    while(jp != null){
                        var newEnv = pc(jp, env);
                        if(newEnv){
                            return newEnv;
                        }
                        jp = jp.parent;
                    }
                    return false;
                });
            },

            cflowbelow: function(pc){
                return wrapPointcut(function (jp, env){
                    //return jp.parent != null && this.cflow(pc)(jp.parent);
                    jp = jp.parent;
                    while(jp != null){
                        var newEnv = pc(jp, env);
                        if(newEnv){
                            return newEnv;
                        }
                        jp = jp.parent;
                    }
                    return false;
                });
            },

            event: function (name){
                return wrapPointcut(function(jp){
                    return jp.kind == JP_CUSTOM &&
                           (jp.name === undefined || jp.name === name); //all custom or the name matches
                });
            },

            not: function(pc){
                return wrapPointcut(function (jp, env){
                    return !pc(jp, env);
                });
            },

            noBR: function(pc, ctx){
                return wrapPointcut(function(jp, env){
                    var pcBR = wrapPointcut(pc);
                    if(ctx !== undefined){
                        var ctxJP = ctx(jp);
                        pcBR = pcBR.and(function(jp){
                            return ctxJP === ctx(jp);
                        });
                    }
                    if(!AspectScript.Pointcuts.cflowbelow(pcBR)(jp, env)){
                        return pc(jp, env);
                    }
                });
            },

            NO_KIND: 1,
            opt: function(filter, pc){
                var optPc = wrapPointcut(function(jp, env){
                    var r = filter(jp, env);
                    if(r === AspectScript.Pointcuts.NO_KIND){
                        if(optPc.kindMask == undefined){
                            optPc.kindMask = 0;
                        }
                        optPc.kindMask |= (1 << jp.kind);
                        return false;
                    }

                    return pc(jp, env);
                });
                return optPc;
            }
        };

        // ---- API CUSTOM JOIN POINT (Public)

        this.event = function(name, args, proceed){
            return weave(jpPool.get(JP_CUSTOM, name, args, proceed, currentJoinPoint));
        };

        //---- API UP & DOWN (Public)

        this.down = function(obj, exp){
            --currentMetaLevel;
            try{
                if(arguments.length == 1){  //obj is the function
                    return obj();
                }
                else{
                    return exp.apply(obj);
                }
            }
            finally{
                ++currentMetaLevel;
            }
        };

        this.up = function (obj, exp){
            ++currentMetaLevel;
            try{
                if(arguments.length == 1){  //obj is the function
                    return obj();
                }
                else{
                    return exp.apply(obj);
                }
            }
            finally{
                --currentMetaLevel;
            }
        };

        //---- Access control ----
        //todo: delete <prop>!
        var acChecker = (function(){
            var aspectScriptProps = [];
            ownForEach(AspectScript, function(name){
                if(name === "globalObject"){
                    return; //we cannot restrict access to the global object
                }
                aspectScriptProps.push(AspectScript[name]);
            });

            var specialMethods = [
                Object.__defineGetter__, Object.__defineSetter__,
                Object.__lookupGetter__, Object.__lookupSetter__,
                Object.unwatch, Object.watch
            ];

            var i13nMethods = [];
            ownForEach(AspectScript.i13n, function(name){
                i13nMethods.push(AspectScript.i13n[name]);
            });

            return {
                checkPW: function(obj, name){
                    //AS
                    {
                        //AspectScript = ...
                        if(obj === AspectScript.globalObject && name === "AspectScript"){
                            throw "ac: assignment to AS"
                        }
                        //AspectScript.* = ...
                        if(obj === AspectScript){
                            throw "ac: pw of AS";
                        }
                        //AspectScript.*.* = ...
                        if(aspectScriptProps.indexOf(obj) >= 0){
                            throw "ac: pw of AS.*";
                        }
                    }
                    //JPs
                    {
                        if(protoJP.isPrototypeOf(obj)){
                            throw "ac: pw of JP";
                        }
                    }
                    //Envs
                    {
                        if(emptyEnv.isPrototypeOf(obj)){
                            throw "ac: pw of JP";
                        }
                    }
                },
                checkCall: function(obj, fun){
                    //AS
                    {
                        //AspectScript.i13n.*()
                        if(obj == undefined && fun == undefined){
                            throw "ac: direct call to i13n";
                        }
                        if(obj === AspectScript.i13n || //direct call
                           i13nMethods.indexOf(obj) >= 0){ //reflective call (target is the function)
                            throw "ac: call";
                        }
                        //call to special methods (on AS or one of its properties)
                        if((obj === AspectScript || aspectScriptProps.indexOf(obj)) >= 0 &&
                           specialMethods.indexOf(fun) >= 0){
                            throw "ac: call to special method (AS or AS.*)";
                        }
                    }
                    //JPs
                    {
                        if(protoJP.isPrototypeOf(obj) && specialMethods.indexOf(fun) >= 0){
                            throw "ac: call to special method (JP)";
                        }
                    }
                    //Envs
                    {
                        if(emptyEnv.isPrototypeOf(obj) && specialMethods.indexOf(fun) >= 0){
                            throw "ac: call to special method (Env)";
                        }
                    }
                }
            }
        })();
    }

    //singleton
    try{
        weavingEnabled = false;
        return new Constructor();
    }
    finally{
        weavingEnabled = true;
    }
})();
