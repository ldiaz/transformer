//This test verify if it is possible to apply an around advice in a custom join point
load("loader.js");

var obj = {
    field:0
};

AJS.around(PCs.event("if-true"), function (){
    Testing.flag("around");
});

if(2 > 0){
    AspectScript.event("if-true", [], function(){
        obj.field = "proceed";
    });
}

Testing.flag(obj.field);

Testing.check("around", 0);