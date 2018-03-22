load("loader.js");

// we test if we can indetify "a" as a property of the global object.
// This is because in the context of the global object, "this" and "var" are the same

//this.a;
//var a;

function classA(){
    this.a = 4;
}

var globalObject = this;
var obj = new classA();

AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

obj.a = 6;

//this.a = 4;
a = 4;

Testing.check(-1);