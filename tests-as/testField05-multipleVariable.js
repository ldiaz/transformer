load("loader.js");

// We test the different changes of "a"'s considering its scope

var globalObject = this;

function f() {
    var a = 3;
    a = 4;
    a = 5;
    return a;
}

AJS.after(PCs.set(globalObject, "a"), function (){
    Testing.flag(1);
});

var a;

f();

a = 4;

Testing.check(1);