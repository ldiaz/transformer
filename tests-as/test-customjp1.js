//This test verifies if it is possible identify a custom join point 

load("loader.js");

AJS.before(PCs.event("if-true"), function (){
    Testing.flag("custom");
});

if(2 > 0){
    AspectScript.event("if-true", [], function(){
    });
}

Testing.check("custom");
