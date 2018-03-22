load("loader.js");


// Is it possible to change the values of jp in a before aspect?
// also see test 12.

function f(){
}

function g(){
}

AJS.before(PCs.exec("f"), function (jp){
    var methods = jp.methods;
    methods[0] = "g";
    Testing.flag(1);
});

AJS.before(PCs.exec("f"), function (jp){
    if(jp.methods[0] == "f")
        Testing.flag(2);
});

f();

Testing.check(2, 1);