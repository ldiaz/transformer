load("loader.js");

function x(){
}

function z(){
}

var adv = function(){
    AJS.down(function(){
        Testing.flag(1);
        z();
    });
};

AJS.before(PCs.exec("x"), adv);


//"z" should not be in the cflow of "x" because it is executed BEFORE the actual execution of "x"
AJS.before(PCs.exec("z").inCFlowOf(PCs.exec("x")), function(){
    Testing.flag(99);
});

x();

Testing.check(1);