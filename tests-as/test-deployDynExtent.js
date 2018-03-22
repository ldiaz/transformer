load("loader.js");

function foo(){
}

function adv(){
    Testing.flag("adv");
}
AJS.deploy(AJS.aspect(AJS.BEFORE, PCs.exec(foo), adv), function (){
    foo(); //the aspect should see this exec
});

foo(); //this should not be seen by the aspect

Testing.check("adv");
