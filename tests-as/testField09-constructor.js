load("loader.js");

//if classA is not an object, then the framwork shouldn't identify the mofidifcation of field "a" 

function classA(){
    this.a = 4;
}

AJS.before(PCs.set(classA,"a"), function (){
    Testing.flag(-1);
});

var obj = new classA();
var a = 4;

Testing.check();


