// This test shows a problem of base reentrancy. Is the base reentrancy based on aspect or pointcut?.
// Two aspects that share the same pointcut are "blocked" each other (the first "blocks" the second).
// because the second is about to be evaluated return base reentrancy

load("loader.js");

function foo(){
}

var pc = PCs.exec(foo);

AJS.before(pc, function (){
    Testing.flag(1);
});

AJS.before(pc, function (){
    Testing.flag(2);
});

foo();

Testing.check(2, 1);
