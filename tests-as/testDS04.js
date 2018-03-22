load("loader.js");

function adv(jp){
    Testing.flag(1);
}

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
}

//deploy aspect on the global object, so c and d are irrelevant
AJS.deployOn([false, false, true], AJS.aspect(AJS.BEFORE, PCs.exec("c"), adv), this);

main();

Testing.check(1);