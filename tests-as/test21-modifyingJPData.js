load("loader.js");


// This test verifies that changes the JoinPoint information is not passed to other aspects.

function f(){
}

AJS.before(PCs.exec("f"), function (jp){
    jp.finalResult = "changed";
    if(jp.finalResult != "changed"){
        Testing.flag("no-change");
    }
});

AJS.before(PCs.exec("f"), function (){
    Testing.flag("adv");
});

f();


Testing.check("no-change", "adv");