load("loader.js");

AJS.before(PCs.set("*", "prop"), function (){
    Testing.flag("adv");
});

var x = {prop: 1}

Testing.check("adv");
