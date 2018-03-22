load("loader.js");

// We test the different changes of "a"'s considering its scope


var obj1 = {
    f1:0,
    f2:0,
    fun1:function() {this.f1 = "obj1";},
    fun2:function() {this.f2 = "obj1";}
};

var obj2 = {
    f1:0,
    f2:0,
    fun1:function() {this.f1 = "obj2";},
    fun2:function() {this.f2 = "obj2";}
};

var pc = function(jp){
    return jp.isPropWrite();
};

AJS.after(PCs.within(obj2).and(pc), function (jp){
    Testing.flag(jp.value);
});

obj1.fun1();
obj1.fun2();
obj2.fun1();
obj2.fun2();

Testing.check("obj2", "obj2");