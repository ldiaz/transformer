load("loader.js");

// advice reentrancy
// reentrance, using composition of pointcuts

var x = 3;

function f(){
}

function g(){
}

var adv = function(){
    AJS.down(function (){
        if(x != 0){
            x--;
            Testing.flag(-1);
            f();
        }
    });
}

//r(f || g)
AJS.before(PCs.exec(f).or(PCs.exec(g)), adv);


f();

Testing.check(-1);