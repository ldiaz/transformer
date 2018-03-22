load("loader.js");


//we test if the order of before and after

var globalObject = this;

AJS.after(PCs.set(globalObject, "a"), function (jp){
    Testing.assert(jp.value +"== 4");
    Testing.flag(1);
});

var a;

a = 4;

Testing.check(1);