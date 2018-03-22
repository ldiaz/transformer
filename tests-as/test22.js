load("loader.js");


function f(jp){
    return jp.name && jp.name == "i";
}

AJS.before(f, function (jp){
    Testing.flag(1);
});

var i = 0;

Testing.check(1);