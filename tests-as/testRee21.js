load("loader.js");

// bug

var pc = function(jp){
    if(!jp.isPropWrite()){
        return false;
    }

    return AJS.down(function(){
        return jp.isPropWrite() && jp.name == "i";
    });
};

AJS.before(pc, function (){
    Testing.flag(1);
},true);

var i = 0;

Testing.check(1);