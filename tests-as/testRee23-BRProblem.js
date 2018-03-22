// This test shows a problem of base reentrancy. Is the base reentrancy based on aspect or pointcut?.
// Two aspects return different results, but these aspects have the same semantics or at least should do the same
// The problem is due to the first evaluates the same pointcut twice.

load("loader.js");

function foo(){
}

var pc = PCs.exec("foo");

AJS.before(pc.and(pc), function (){
    Testing.flag(1);
});

AJS.before(PCs.exec("foo").and(PCs.exec("foo")), function (){
    Testing.flag(2);
});

foo();

Testing.check(2,1);
