load("loader.js");

var globalObject = this;

function foo1(){

    return function foo(){
        a = 6; // this modification should be on the global object (despite the extra levels introduced by foo1 and foo)
                // because the variable used without "var"
    };
}


AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

var myFun = foo1();
myFun();

Testing.check(-1);