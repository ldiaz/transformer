load("loader.js");

function foo1(){
    return 5;
}

function foo2(){
    foo1();
    return 6;
}

AJS.after(PCs.exec("foo1").inCFlowOf(PCs.exec("foo2")), function (){
    Testing.flag(1);
});

foo2();

Testing.check(1);
