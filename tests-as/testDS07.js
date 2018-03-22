load("loader.js");

//this used to fail with a "too much recursion" exception
var asp1 = AJS.deployOn(
        [true, true, true],
        AJS.aspect(AJS.AROUND,
                function(){
                    return true;
                },
                function(jp){
                    return jp.proceed();
                }),
        this);

var asp2 = AJS.deployOn(
        [true, true, true],
        AJS.aspect(AJS.AROUND,
                function(){
                    return true;
                },
                function(jp){
                    return jp.proceed();
                }),
        this);

{
    function a(){
        b();
    }

    function b(){

    }
}


Testing.check();
