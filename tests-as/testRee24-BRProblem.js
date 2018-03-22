// This test shows a problem of base reentrancy. Is the base reentrancy based on aspect or pointcut?.
// Two aspects return different results, but these aspects have the same semantics or at least should do the same
// The problem is due to the first evaluates the same pointcut twice.

load("loader.js");

function foo1(){
}

function foo2(){
    foo1();
}

AJS.before(PCs.cflow(PCs.exec(foo2)).and(PCs.exec(foo1)), function (){
    Testing.flag(1);
});

AJS.before(PCs.exec(foo1).and(PCs.cflow(PCs.exec(foo2))), function (){
    Testing.flag(2);
});

AJS.before(PCs.exec(foo1).inCFlowOf(PCs.exec(foo2)), function (){
    Testing.flag(3);
});


foo2();

Testing.check(3,2,1);
