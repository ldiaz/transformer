load("loader.js");

// Pointcut Reentrance
var x = true;

function f(){
}

var pc = function(jp){
    if(!jp.isExec()){
        return false;
    }

    return AJS.down(function (){
        if(x){
            Testing.flag("pc");
            x = false;
            f();
        }
        return true;
    });
};

AJS.before(pc, function(){
    Testing.flag("adv");
});

f();

Testing.check("pc", "adv");