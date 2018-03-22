load("loader.js");

var globalObject = this;

var x = 10; //create getter and setter for this variable

globalObject.__defineGetter__("a", function(){
    Testing.flag("get");
    return x;
});

globalObject.__defineSetter__("a", function(val){
    Testing.flag("set");
    x = val;
});

function outer(){

    return function inner(){
        a = 6; // this modification should be on the global object setter
               // because the variable is used without "var"
        return a; //this should invoke the getter
    };
}

AJS.before(PCs.set(globalObject, "a"), function (jp){
    Testing.flag("adv");
});

var myFun = outer();
myFun();

Testing.check("adv", "set", "get");
