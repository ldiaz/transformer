load("loader.js");


//we test if we can change an assignment

var globalObject = this;

var newValue = 6;

AJS.around(PCs.set(globalObject, "a"), function (jp){
    Testing.flag(-1);
    return jp.proceed(newValue);
});


var a;

a = 4;

Testing.assert(a+" == "+newValue);
Testing.check(-1);