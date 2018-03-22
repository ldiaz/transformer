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

AJS.deploy(
        [PCs.call(a).or(PCs.call(b)).or(PCs.call(c)), false, true],
        AJS.aspect(AJS.BEFORE, PCs.exec("c"), adv),
        main);

Testing.check(1);