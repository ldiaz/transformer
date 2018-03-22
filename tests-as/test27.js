load("loader.js");


var x = new Function("Testing.flag('ok')");
x();

Testing.check("ok");
