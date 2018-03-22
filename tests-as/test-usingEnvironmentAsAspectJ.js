load("loader.js");


function f(){
}

function time(v){
    return function(jp, env){
        return env.bind([v, new Date().getMilliseconds()]);
    };
}

AJS.before(PCs.exec(f).and(time("t1")), function (jp, env){
    Testing.flag(typeof(env.get("t1")) == "number");
});

f();


Testing.check(true);
