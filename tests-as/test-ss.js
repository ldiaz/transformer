load("loader.js");


function K(){
    this.m = function(){
        this.f(); //there must be a call to introduce the propagation bug
    };
    this.f = function(){
        //nothing
    };
}

var obj = new K();
var obj2 = new K();

var pc = function(){
    return true;
};
var adv = function(jp){
    Testing.flag(jp);
    return jp.proceed();
};

var asp = AJS.aspect(AJS.AROUND, pc, adv);
AJS.deployOn([true, false, true], asp, obj);

//AJS.tracer.enable();

obj.m();
obj2.m();

Testing.check("[exec: m]", "[pr: f]", "[call: f]", "[exec: f]");

//AJS.tracer.dump();