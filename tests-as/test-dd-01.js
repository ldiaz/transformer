load("loader.js");

function adv(jp){
    Testing.flag(1);
}

var obj = {f: 1};

function main(){
    a();
}

function a(){
    b();
}

function b(){
    c();
}

function c(){
    obj.f = 0;
}

//deploy aspect on the global object, so the stack is irrelevant
AJS.deployOn(AJS.aspect(AJS.BEFORE, PCs.set(obj, "f"), adv), this);

main();

Testing.check(1);