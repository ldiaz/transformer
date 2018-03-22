load("loader.js");

function foo1(){
}

function foo2(){
    foo1();
}

AJS.after(PCs.exec(foo1).and(PCs.cflow(PCs.exec(foo2))), function (){
    Testing.flag("1");
});

AJS.after(PCs.exec(foo1).inCFlowOf(PCs.exec(foo2)), function (){
    Testing.flag("2");
});

foo1();
foo2();

Testing.check("1", "2");
