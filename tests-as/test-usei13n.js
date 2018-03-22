load("loader.js");

try{
    AspectScript.i13n.wrap();
}
catch(e){
    Testing.flag("wrap");
}

try{
    AspectScript.i13n.call();
}
catch(e){
    Testing.flag("call");
}

try{
    AspectScript.i13n.call2();
}
catch(e){
    Testing.flag("call2");
}

try{
    AspectScript.i13n.propWrite();
}
catch(e){
    Testing.flag("propWrite");
}

try{
    AspectScript.i13n.propWrite2();
}
catch(e){
    Testing.flag("propWrite2");
}

try{
    AspectScript.i13n.withPush();
}
catch(e){
    Testing.flag("withPush");
}

try{
    AspectScript.i13n.withPop();
}
catch(e){
    Testing.flag("withPop");
}

try{
    AspectScript.i13n.objectInWithHasProperty();
}
catch(e){
    Testing.flag("objectInWithHasProperty");
}

try{
    AspectScript.i13n.uncertainWrite();
}
catch(e){
    Testing.flag("uncertainWrite");
}


Testing.check(
        "wrap", "call", "call2", "propWrite", "propWrite2", "withPush", "withPop", "objectInWithHasProperty", "uncertainWrite"
        );
