load("loader.js");

//todo: comment me

function Point(id){

    this.id = id;
    this.x = 0;
    this.y = 0;


    this.getX = function(){
        return this.x;
    };
    this.getY = function(){
        return this.y;
    };

    this.setX = function(_x){
        this.x = _x;
    };
    this.setY = function(_y){
        this.y = _y;
    };

    this.moveTo = function(_x, _y){
        this.setX(_x);
        this.setY(_y);
    };

    this.toString = function(){
        return this.getX() + " & " + this.getY();
    };

    this.isInside = function(_x, _y){
        return (this.x <= _x && this.y <= _y);
    };

    this.attract = function(p){
        p.moveTo(this.x + 1, this.y);
    };
}


var p1 = new Point("point 1");
var p2 = new Point("point 2");


var ctx = function (jp){
    return jp.target;
};

var pc = function(jp){
    return jp.isExec() && jp.target.constructor == Point;
};

AJS.before(PCs.noBR(pc, ctx), function (jp){
    Testing.flag(jp.target.id);
});


p2.attract(p1);

//2 execs
Testing.check("point 2", "point 1");