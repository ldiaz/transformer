load("loader.js");

function foo1() {
    return 5;
}

function foo2() {
    temp(foo1, 0);
    return 6;
}

function temp(fun, index) {
    if (index < 10)
        return temp(fun, ++index);
    else
        return fun();
}

AJS.after(PCs.exec("foo1").inCFlowOf(PCs.exec("foo2")), function () {
    Testing.flag(1);
});

foo2();

Testing.check(1);
