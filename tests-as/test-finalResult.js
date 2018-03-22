load("loader.js");

function a(){
    return "a";
}

AJS.after(PCs.call(a), function (jp){
    Testing.flag(jp.finalResult);
});

AJS.after(PCs.exec(a), function (jp){
    Testing.flag(jp.finalResult);
});

AJS.after(PCs.set("i"), function (jp){
    Testing.flag(jp.finalResult);
});

AJS.after(PCs.set(a, "f"), function (jp){
    Testing.flag(jp.finalResult);
});

a();

(function(){
    var i = 0;
})();

a.f = "f";


Testing.check("a", "a", 0, "f");
