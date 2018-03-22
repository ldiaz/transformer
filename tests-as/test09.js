load("loader.js");

//todo: comment me

function foo() {
    return 1;
}

AJS.around(PCs.exec("foo"), function () {
    Testing.flag("around");
    return 2;
});

AJS.after(PCs.exec("foo"), function (jp) {
    Testing.flag("after");
    Testing.assert(jp.finalResult + " == 2");
});

AJS.before(PCs.exec("foo"), function () {
    Testing.flag("before");
});

var r = foo();

Testing.assert(r + " == 2");
Testing.check("before", "around", "after");




