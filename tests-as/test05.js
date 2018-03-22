load("loader.js");

function foo(){
    return 5;
}


AJS.after(PCs.exec("foo"), function (jp){
    Testing.flag("after-1");
    Testing.assert(jp.finalResult + " == 5");
});

AJS.after(PCs.exec(foo), function (jp){
    Testing.flag("after-2");
    Testing.assert(jp.finalResult + " == 5");
});

foo();

Testing.check("after-1", "after-2");