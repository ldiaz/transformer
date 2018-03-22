 load("loader.js");

function foo(){
}

function g(){
}

AJS.before(PCs.exec(foo), function (){
    Testing.flag("adv");
});

g();

foo();

Testing.check("adv");
