load("loader.js");

//we test if we can identify thw write of a variable.

var obj = {
    prop: "prop",
    foo: function(){
        Testing.flag(this.prop);
    }
};

AJS.before(PCs.get("index"), function (){
    Testing.flag("get");
});

obj.foo();

Testing.check("prop");