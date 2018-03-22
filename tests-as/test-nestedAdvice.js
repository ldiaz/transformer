load("loader.js");

function foo(){
    Testing.flag("foo");
}

function adv1(jp){
    Testing.flag("adv-1");
    return jp.proceed();
}

function adv2(jp){
    Testing.flag("adv-2");
    return jp.proceed();
}

function adv3(jp){
    Testing.flag("adv-3");
    return jp.proceed();
}

AJS.around(PCs.exec(foo), adv1);
AJS.around(PCs.exec("dummy"), adv2);
AJS.around(PCs.exec(foo), adv3);

foo();


Testing.check("adv-3", "adv-1", "foo");