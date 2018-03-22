load("loader.js");

var array = [0, ["a", "b"], {a: "m"}, {bb: "m"}];


Testing.assert2("1", typeof(array[0]) != "undefined");
delete array[0];
Testing.assert2("1", typeof(array[0]) == "undefined");

Testing.assert2("2", typeof(array[1][0]) != "undefined");
delete array[1][0];
Testing.assert2("2", typeof(array[1][0]) == "undefined");

Testing.assert2("3", typeof(array[2].a) != "undefined");
delete array[2].a
Testing.assert2("3", typeof(array[2].a) == "undefined");

Testing.assert2("4", typeof(array[3].bb) != "undefined");
delete array[3]["b"+"b"]
Testing.assert2("4", typeof(array[3].bb) == "undefined");
