load("loader.js");

var globalObject = this;

var a = 3;  //this is optional
function foo() {
    var a;
    a = 6; // this modification should be on the local var
          // because the variable was declared using "var"
}

AJS.before(PCs.set(globalObject, "a"), function (){
    Testing.flag(-1);
});

foo();

Testing.check();