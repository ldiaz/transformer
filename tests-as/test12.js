load("loader.js");

// Here, we check if the before aspect can change arguments of a call.
// Is it possible to change the values of jp in a before aspect? 

function foo(a, b) {
    return a + b;
}

AJS.before(PCs.exec("foo"), function (jp) {
    var args = jp.args;
    args[0] = 1;
    Testing.flag(-1);
});

var r = foo(2,5);

Testing.assert(r + " == 7");
Testing.check(-1);