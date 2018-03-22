load("loader.js");

//todo: comment me

function foo(){
}

function adv(jp){
    if(!jp.finalResult){ //only match if the pc returned true
        return false;
    }
    Testing.flag("PC-pc: " + jp);
}

var pc = function (jp){
    return jp.isExec() && jp.fun == foo;
};

AJS.before(pc, function(){
    Testing.flag("foo");
});

AJS.up(function(){
    AJS.after(PCs.exec(pc), adv);    
});


foo();

Testing.check("PC-pc: [exec: ]", "foo");