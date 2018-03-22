load("loader.js");


function g(){
    var x = 5;
    var y = 5;

    try{
        f(x, y);
    }
    catch(e){
    }
}

function f(x, y){
    if(x + y == 0){
        throw "error";
    }

    var ox = x;
    var oy = y;

    x = x - 1;
    y = y - 1;
    f(x, y);

    Testing.assert(x + " == " + (ox - 1));
    Testing.assert(y + " == " + (oy - 1));
}

var pc = function(jp){
    return jp.isCall();
};

AJS.around(PCs.noBR(pc), function (jp){
    Testing.flag(jp.methods[0]);
    return jp.proceed();
});

g();

Testing.check("g", "check");
