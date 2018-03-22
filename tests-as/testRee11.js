load("loader.js");

var x = 3;

function f(){
}

function ctx(){
    return x;
}

var adv = function(){
    AJS.down(function (){
        if(x != 0){
            Testing.flag(-1);

            x--;
            f();
        }
    });
};

AJS.before(PCs.exec(f),adv,ctx);



f();

Testing.check(-1);