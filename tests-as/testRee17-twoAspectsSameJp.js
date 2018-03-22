load("loader.js");

// The first aspect does not trigger a piece of advice when the function g() is executed because of Base Rentrance.
// Instead, the second aspect triggers its piece of advice when function g() is executed because there is not reentrance

function f(){
    g();
}

function g(){

}

AJS.before(PCs.noBR(PCs.exec(f).or(PCs.exec(g))), function (){
    Testing.flag(-1);
});

AJS.before(PCs.exec(g), function (){
    Testing.flag(1);
});


f();

Testing.check(-1, 1);