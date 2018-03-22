load("loader.js");


var obj = {
    m: function(){
        this.f();
    },
    f: function(){
        //nothing
    }
};

var pc = function(){
    return true;
};
var adv = function(jp){
    Testing.flag(jp);
};
var adv2 = function(jp){
    Testing.flag(jp);
    return jp.proceed();
};

AJS.deployOn(AJS.aspect(AJS.BEFORE, pc, adv), obj);
AJS.deployOn(AJS.aspect(AJS.AROUND, pc, adv2), obj);
AJS.deployOn(AJS.aspect(AJS.AFTER, pc, adv), obj);

obj.m();

Testing.check(
        "[exec: m]", "[exec: m]", "[pr: f]",
        "[pr: f]", "[pr: f]", "[call: f]",
        "[call: f]", "[exec: f]", "[exec: f]",
        "[exec: f]", "[call: f]", "[exec: m]"
        );
