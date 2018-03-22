load("loader.js");

//todo: comment me

// Base Reentrance
function f(n) {
    if (n == 1)
        return false;
    else
        return f(n-1);
}

AJS.before(PCs.exec(f),function() {
        Testing.flag(-1);
});

f(3);

Testing.check(-1,-1,-1);
