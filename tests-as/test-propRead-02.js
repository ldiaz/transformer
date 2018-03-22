load("loader.js");

AJS.before(PCs.get("a"), function (){
    Testing.flag(-1);
});

function x(){
    var a = 1;
    var x = a;  //here we use a
}

x();

Testing.check(-1);