load("loader.js");

function f(){}

AJS.deployOn(AJS.aspect(AJS.AROUND,
        function(){
            return true;
        },
        function(jp){
            f();
            return jp.proceed();
        }),
        this);

{
    var x = 1;
}

Testing.check();