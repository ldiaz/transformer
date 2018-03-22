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

AJS.deploy([true, false, true], AJS.aspect(AJS.BEFORE, PCs.exec("c"), adv), main);

Testing.check(1);
