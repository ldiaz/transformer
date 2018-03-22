load("loader.js");


function f(){
}

function x(){
    throw "error...";
}

AJS.before(PCs.call(f), function (jp){
    try{
        x();
    }
    catch(e){
        Testing.flag("ok");
    }
});

f();

Testing.check("ok");
