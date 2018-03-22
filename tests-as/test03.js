load("loader.js");


function foo(){
    return 5;
}

AJS.around(PCs.exec("foo"), function (){
    Testing.flag(100);
    return 7;
});

var r = foo();

Testing.assert(r+" == 7");
Testing.check(100);
