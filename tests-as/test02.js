load("loader.js");


function foo(){
    return 5;
}

AJS.after(PCs.exec("foo"), function (jp){
    Testing.flag(1);
    Testing.assert(jp.finalResult + " == 5");
});


foo();

Testing.check(1);