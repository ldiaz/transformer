load("loader.js");

//pointcut Reentrance

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

    this.dummy = function(){
    };

    this.isInside = function(_x, _y){
        return (x <= _x && y <= _y);
    };

    this.attract = function(p){
        p.moveTo(this.x + 1, this.y);
    };
}


var p = new Point();

var pc = function(jp){
    return AJS.down(function(){
        var target = jp.target;
        return jp.isExec() && target.constructor == Point && target.isInside(2, 2);
    });
};

AJS.before(PCs.noBR(pc), function (){
    Testing.flag(-1);
});


p.moveTo(1, 1);

Testing.check(-1);