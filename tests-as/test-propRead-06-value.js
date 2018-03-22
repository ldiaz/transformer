load("loader.js");

//we test if we can identify thw write of a variable.

var obj = {
    prop: "prop"
};

AJS.after(PCs.get(obj,"prop"), function (jp){
    Testing.flag(jp.target["prop"]);
});

var x = obj.prop;
Testing.check("prop");
