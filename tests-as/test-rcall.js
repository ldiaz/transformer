load("loader.js");

function a(){
}

var obj = {a: a};

AJS.before(PCs.call("a"), function (jp){
    Testing.flag("by name");
    Testing.assert(jp.target === obj);
    Testing.assert(jp.fun === a);
    Testing.assert(jp.args[0] === 1 && jp.args[1] === 2 && jp.args[2] === 3);
});

AJS.before(PCs.call(a), function (jp){
    Testing.flag("by ref");
    Testing.assert(jp.target === obj);
    Testing.assert(jp.fun === a);
    Testing.assert(jp.args[0] === 1 && jp.args[1] === 2 && jp.args[2] === 3);
});

AJS.before(PCs.exec(a), function (jp){
    Testing.flag("exec");
    Testing.assert(jp.target === obj);
    Testing.assert(jp.fun === a);
    Testing.assert(jp.args[0] === 1 && jp.args[1] === 2 && jp.args[2] === 3);
});

obj.a(1, 2, 3);
a.call(obj, 1, 2, 3);
a.apply(obj, [1, 2, 3]);


Testing.check(
        "by ref", "by name", "exec", //a()
        "by ref", "by name", "exec", //a.call()
        "by ref", "by name", "exec"  //a.apply()
        );
