load("loader.js");

//to verify the order of execution.

function foo(){
    Testing.flag("foo");
}

AJS.before(PCs.call("foo"), function (){
    Testing.flag("before");
});

AJS.after(PCs.call("foo"), function (){
    Testing.flag("after");
});

foo();

Testing.check("before","foo","after");
