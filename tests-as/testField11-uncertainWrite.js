load("loader.js");

var globalObject = this;

var a = 3;
function foo1(){
    var a = 4;

    return function foo(){
        a = 6; // this modification should be on the local var (declared in foo1)
               // because the variable was declared using "var"
    };
}

AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

var myFun = foo1();
myFun();

Testing.check();