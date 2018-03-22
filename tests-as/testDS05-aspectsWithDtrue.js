load("loader.js");

function f(){
}

var adv = function(jp){
    Testing.flag(1);
};

//deploy an aspect on the global object with d = true
//it should see the call to "f" because the aspect is inside x, which is inside object
AJS.deployOn([false, true, true], AJS.aspect(AJS.BEFORE, PCs.call(f), adv), AJS.globalObject);

var object = {
    x:function(){
        f();
    }
};

object.x();
Testing.check(1);

