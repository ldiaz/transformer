load("loader.js");

function foo(){
}

var aspect = AJS.aspect(AJS.BEFORE, PCs.exec(foo), function (jp){
    Testing.flag("level: " + jp.metaLevel);
    foo();
});

AJS.deploy(aspect);
AJS.up(function() {
    AJS.deploy(aspect);
});

foo();

Testing.check("level: 1", "level: 2");
