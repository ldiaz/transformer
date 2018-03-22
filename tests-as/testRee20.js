load("loader.js");

// pc function must be wrapped and when called as a pointcut it should not generate exec jps

var f = function(jp){
    return jp != null && jp.isPropWrite();
};

AJS.before(PCs.exec(f), function (){
    Testing.flag("exec-f");
});

AJS.before(f, function (){
    Testing.flag("f");
});

var i = 0;
f(null);

Testing.check("f", "exec-f");