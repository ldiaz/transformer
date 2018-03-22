load("loader.js");

function foo(a, b) {
    return a + b;
}

AJS.around(PCs.call("foo"), function (jp) {
    Testing.flag(-1);
    return jp.proceed(10,10);
});

var r = foo(2,5);

Testing.assert(r + " == 20");
Testing.check(-1);