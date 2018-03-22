load("loader.js");

function foo1(a, b){
    return a + b;
}

function foo2(){
    return 5 + (function(a, b){
        return a + b;
    })(2, 5);
}

function pointcut(jp){
    return jp.isCall() && jp.args[0] == 2;
}

AJS.before(pointcut, function (jp){
    if(jp.isCall()){
        Testing.flag("c:" + jp.methods.join(""));
    }
    else{
        Testing.flag("e");
    }
});

foo1(2, 5);
foo2();

//one for "foo1(2,5) and one for the lambda inside "foo2"
Testing.check("c:foo1", "c:");