load("loader.js");

// advice Reentrance
var x = 3;

function f(){
}

var adv = function(jp){

    AJS.down(function(){
        if(x != 0){
            Testing.flag("adv");
            x--;
            f();
        }
    });
};

AJS.before(PCs.exec(f), adv);

f();

Testing.check("adv");