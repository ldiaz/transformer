load("loader.js");

//todo: comment me

function foo(){
}

function adv(){
    Testing.flag("adv");
}

AJS.before(PCs.exec(foo), adv);

AJS.up(function(){
    AJS.before(PCs.exec(adv), function(){
        Testing.flag("match-adv");
    });
});


foo();


Testing.check("match-adv", "adv");