load("loader.js");

var array = [0, 1, 2, 3, 4];

Testing.assert2("1", array[1] == 1);
Testing.assert2("2", array[f()] == 2);
Testing.assert2("4", array[array.length - 1] == 4);

function f(){
    return 2;
}

array[0] = f;

Testing.assert2("a", array[2] == 2);
Testing.assert2("b", array[f()] == 2);
Testing.assert2("c", array[array[1 - 1]()] == 2);


function x(){
  return [0,1,2];
}


Testing.assert2("x", x("m")[1] == 1);

