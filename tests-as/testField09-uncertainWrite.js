load("loader.js");

var globalObject = this;

function foo() {
    a = 6; // this modification should be on the global object
          // because the variable used without "var"
}

AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

foo();

Testing.check(-1);