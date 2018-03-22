load("loader.js");


AJS.before(PCs.get("e").or(PCs.get("e2")), function (jp){
    Testing.flag(jp.name);
});

var tmp;

try{
    throw "";
}
catch(e){
    tmp = e;
    try{
        throw "";
    }
    catch(e2){
        tmp = e2;
    }
}

tmp = e;  //this is a property read, not a var read 


Testing.check("e", "e2");
