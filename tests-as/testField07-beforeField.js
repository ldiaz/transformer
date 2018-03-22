load("loader.js");

// we test if we can identify when "a" of obj is modified
var a;

function classA(){
    this.a = 4;
}

var obj = new classA();
AJS.before(PCs.set(obj, "a"), function (){
    Testing.flag(-1);
});

obj.a = 6;

a = 4;

Testing.check(-1);