load("loader.js");

function adv(jp){
    Testing.flag(jp.toString());
}

function main(){
    a(); //the aspect must see this, regardless of its "c" component
}

function a(){

};

AJS.deploy(
        [false, false, true],
        AJS.aspect(AJS.BEFORE, PCs.call(a), adv),
        main
        );

Testing.check("[call: a]");

