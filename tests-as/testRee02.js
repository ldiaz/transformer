load("loader.js");

//advice Reentrance

function Point(){

    var x = 0;
    var y = 0;


    this.getX = function(){
        return x;
    };
    this.getY = function(){
        return y;
    };
    this.setX = function(_x){
        x = _x;
    };
    this.setY = function(_y){
        y = _y;
    };

    this.moveTo = function(_x, _y){
        this.setX(_x);
        this.setY(_y);
    };

    this.toString = function(){
        return this.getX() + " & " + this.getY();
    };

    this.isInside = function(_x, _y){
        return (x <= _x && y <= _y);
    };

    this.attract = function(p){
        p.moveTo(x + 1, y);
    };
}

var p = new Point();

var pc = function(jp){
    return jp.isExec() && jp.target.constructor == Point;
};

var adv = function(jp) {
  AJS.down(function (){
        jp.target.toString();
        Testing.flag(-1);
    });
};

//there are base reentrancy (moveTo,setX,setY) and adviceReentrancy
AJS.before(PCs.noBR(pc), adv);

p.moveTo(1, 1);

Testing.check(-1);
