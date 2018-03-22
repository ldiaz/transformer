load("loader.js");

// Reentrance allowed
// Pointcut Reentrance
var x = 3;

function f(){
}

function pc(jp){
    if(!jp.isCall() || jp.fun != f){
        return false;
    }

    return AJS.down(function(){
        if(x != 0){
            Testing.flag("pc");
            x--;
            f();
        }
        return false;
    });
}

AJS.before(pc,function(){
        }, true);

f();

//Testing.check("pc");
//with PR, the result was:
Testing.check("pc", "pc", "pc");