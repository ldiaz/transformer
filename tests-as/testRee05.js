load("loader.js");

// Base Reentrance
function f(n) {
    if (n == 0)
        return false;
    else
        return f(n-1);
}

var pc = function(jp,env) {
    return jp.isExec() && jp.fun == f;
};

AJS.before(PCs.noBR(PCs.exec(f)),function() {
        Testing.flag("adv");
});

f(3);

Testing.check("adv");
