load("loader.js");

//we test if we can identify thw write of a variable.


AJS.before(PCs.get("index"), function (){
    Testing.flag("get");
});

function x(index){
    if(index == 1){
        return;
    }

    x(index - 1);
}

x(3);

Testing.check("get", "get", "get", "get", "get");