load("loader.js");

// allowed reentrance
// advice Reentrance
var x = 3;

function f(){
}

var adv = function(jp){

    AJS.down(function (){
        if(x != 0){
            Testing.flag(-1);
            x--;
            f();
        }
    });
};

//todo: true is used to permit the reentrancy
AJS.before(PCs.exec(f), adv, true);

f();

Testing.check(-1, -1, -1);