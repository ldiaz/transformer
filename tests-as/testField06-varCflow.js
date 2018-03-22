load("loader.js");

// We test the different changes of "a" considering its scope of "f"

function f() {
    var a = 3;
    return a;
}

AJS.after(PCs.set("a").inCFlowOf(PCs.exec(f)), function (){
    Testing.flag(1);
});

var a;

f();

a = 4;

Testing.check(1);