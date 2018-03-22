//this test verifies if is possible to capture/mantain updated the variable exposed by a custom join point
load("loader.js");

AJS.before(PCs.event("alert"), function (jp){
    Testing.flag(jp.ctx);
});

AJS.after(PCs.event("alert"), function (jp){
    Testing.flag(jp.ctx);
});

var y = "before";
AspectScript.event("alert", {ctx: y}, function(){
    y = "proceed";
});

//todo: context change in the thunk?
//Testing.check("before", "proceed");
