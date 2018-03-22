//this test verifies if is possible to capture/mantain updated the variable exposed by a custom join point
load("loader.js");

AJS.around(PCs.event("alert"), function (jp){
    return jp.proceed("replaced!");
});

var y = "original";
AspectScript.event("alert", [y], function(){
    Testing.flag(y);
});

//todo: how to change the context
//Testing.check("replaced!");
