load("loader.js");

function foo(){
    return 5;
}

var pc = PCs.exec("foo").and(function(jp){
    return jp.finalResult == 5;
});

AJS.after(pc, function (jp){
    Testing.flag(1);
});

foo();

Testing.check("The poincut of an aspect was evaluated before jp.finalResult is available");