load("loader.js");

// Verifying if we can identify the creation of an object.

function foo(){
}

AJS.before(PCs.creation(foo), function(){
    Testing.flag(-1);
});

foo();
new foo();

Testing.check(-1);