load("loader.js");


function foo(a){
    return a;
}

AJS.after(PCs.exec("foo"), function (jp){
    var clonedJp = jp.clone();
    Testing.flag("match");

    if(jp.finalResult == clonedJp.finalResult){
        Testing.flag("finalResult");
    }
    if(jp.toString() == clonedJp.toString()){
        Testing.flag("toString()");
    }
    if(jp !== clonedJp){
        Testing.flag("different");
    }
});


foo(5);

Testing.check("match", "finalResult", "toString()", "different");