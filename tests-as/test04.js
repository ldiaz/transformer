load("loader.js");


function foo(){
    return 5;
}

var a = function (){
    Testing.flag("1");
};

var b = function (){
    Testing.flag("2");
};

var c = function (){
    Testing.flag("3");
};

var d = function (){
    Testing.flag("4");
};

AJS.before(PCs.exec(foo), a);

AJS.before(PCs.exec("foo"),b);

AJS.before(PCs.exec("foo"), c);

AJS.before(PCs.exec("foo"), d);

foo();

Testing.check("4","3","2", "1");
