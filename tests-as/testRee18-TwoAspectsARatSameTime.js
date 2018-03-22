load("loader.js");

// reentrance

// In this test, we test advice reentrance at the same time.
// First off, there is call to f()
// Afterwards, the first aspect executes its advice, this advice call to g().
// Then, the second aspect executes its advice, which call to f()
// The first aspect identifies successfully this call because of advice reentrance

// variable to control the reentrance in the advice

var x = 5;

function f(){
}

function g(){
}

function adv1(){

    AJS.down(function(){
        if(x != 0){
            x--;
            Testing.flag("adv1");
            g();
        }
    });
}

function adv2(){

    AJS.down(function(){
        if(x != 0){
            x--;
            Testing.flag("adv2");
            f();
        }
    });
}

AJS.before(PCs.exec(f), adv1);
AJS.before(PCs.exec(g), adv2);

f();

Testing.check("adv1", "adv2");