load("loader.js");

//we test if we can identify the write of a variable.

var globalObject = this;

AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag("ok");
});

var a;

a = 4;

Testing.check("ok");