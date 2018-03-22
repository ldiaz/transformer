load("loader.js");

//todo: comment me
// reentrance, using composition of pointcuts

var x = 3;

function f(){
}

function g(){
}

function pc(jp){
    if(!jp.isExec() || jp.fun !== f){
        return false;
    }

    return AJS.down(function (){
        if(x != 0){
            Testing.flag("pc");
            --x;
            f();
        }
        return false;
    });
}

//r(pc || exec(g))
AJS.before(PCs.exec(g).or(pc), function (){
}, true);

f();

//with PR, the result was:
Testing.check("pc", "pc", "pc");