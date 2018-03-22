load("loader.js");

var instanceOf = function(constructor){
    return function(jp){
        //print(jp.fun === constructor)
        return jp.fun === constructor;
    };
};

var adv = function(jp){
    Testing.flag("should not be invoked for: " + jp);
};

function Point(){
    this.move = function(x, y){
        this.x = x;
        this.y = y;
    };
}

function NotAPoint(){

}

//deploy an aspect on the global object
AJS.deployOn(
        [false, instanceOf(NotAPoint), true],
        AJS.aspect(AJS.BEFORE, PCs.exec("move"), adv),
        this);

var point = new Point();
point.move(0, 0);

Testing.check();