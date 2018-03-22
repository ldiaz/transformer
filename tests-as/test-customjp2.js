//This test verifies if in an after advice of a custom join point is possible to change a
// value of the expression of custom join point

load("loader.js");

var obj = {
    field:0
};

AJS.after(PCs.event("if-true"), function (){
    obj.field = "after";
});

if(2 > 0){
    AspectScript.event("if-true", [], function(){
        obj.field = 1;
    });
}

Testing.flag(obj.field);

Testing.check("after");
