load("loader.js");

var globalObject = this;

AJS.before(PCs.get(globalObject, "a"), function (){
    Testing.flag(-1);
});

var a = 1;
var x = a;  //here we use a

Testing.check(-1);