load("loader.js");

// identify the function call created with statement "new Function" 

var foo = new Function("");


AJS.before(PCs.exec("foo"), function (){
    Testing.flag(-1);
});

foo();


Testing.check(-1);
