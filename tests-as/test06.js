load("loader.js");

function foo(){
    return 5;
}


AJS.around(PCs.exec(foo), function (){
    Testing.flag("not-executed");
    return 7;
});

AJS.around(PCs.exec("foo"), function (){
    Testing.flag("no-proceed");
    return 6;
});

var r = foo();

Testing.assert(r + " == 6");
Testing.check("no-proceed");