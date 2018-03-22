load("loader.js");


var x = true? true? "'tarak'": false: false;
var y = true? true? true? "'flex'": false: false: false;


Testing.assert(x + " == 'tarak'");
Testing.assert(y + " == 'flex'");
