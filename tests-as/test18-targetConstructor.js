load("loader.js");

// The before aspect can't see an object fields before this object is created.
// Note: a function called with "new" constructor cannot be identified by name, only works by reference.

function Class(_a) {
    this.a = _a;
}


AJS.before(PCs.init(Class), function (jp){
    if (jp.target.a == null)
        Testing.flag(-1);
});

var object = new Class(3);


Testing.check(-1);