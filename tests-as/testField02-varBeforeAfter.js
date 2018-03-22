load("loader.js");

//we test if the order of before and after

var globalObject = this;


AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

AJS.after(PCs.set(globalObject, "a"), function (){
    Testing.flag(2);
});

var a;

a = 4;

Testing.check(-1,2);