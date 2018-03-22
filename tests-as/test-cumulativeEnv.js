load("loader.js");


function f(){
}

function time(v){
    return function(jp, env){
        return env.bind([v, new Date().getMilliseconds()]);
    };
}

function delta(a, b, n){
    return function(jp, env){
        return env.bind([n, env.get(b) - env.get(a)]).unbind(a, b);
    };
}

AJS.before(PCs.call(f).and(time("t1")).and(PCs.call(f)).and(time("t2")).and(delta("t1", "t2", "delta")),
        function (jp, env){
            Testing.flag(typeof(env.get("delta")) == "number");

            try{
                env.get("t1");
            }
            catch(e){
                Testing.flag("ex 1");
            }
            
            try{
                env.get("t2");
            }
            catch(e){
                Testing.flag("ex 2");
            }
        });

f();

Testing.check(true, "ex 1", "ex 2");
