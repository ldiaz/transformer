load("loader.js");

// This test verifies if we can only identify objects that have a specific interface.
// Note: here, there is also pointcut reentrance.

// Pattern interface
var Interface = function(name, methods){
    if(arguments.length != 2){
        throw new Error("Interface constructor called with " + arguments.length +
                        " arguments, but expected exactly 2.");
    }
    this.name = name;
    this.methods = [];
    for(var i = 0, len = methods.length; i < len; i++){
        if(typeof methods[i] !== 'string'){
            throw new Error("Interface constructor expects method names to be "
                    + "passed in as a string: " + (typeof methods[i]));
        }
        this.methods.push(methods[i]);
    }
};

// Interface method to check an if the 'object' has one or more interfaces.
Interface.ensureImplements = function(object){
    if(arguments.length < 2){
        return false;
    }
    for(var i = 1, len = arguments.length; i < len; i++){
        var iface = arguments[i];
        if(iface.constructor !== Interface){
            return false;
        }

        for(var j = 0, methodsLen = iface.methods.length; j < methodsLen; j++){
            var method = iface.methods[j];
            if(!object[method] || typeof object[method] !== 'function'){
                return false;
            }
        }
    }
    return true;
};

// creating interface
var vehiculeInterface = new Interface('vehiculeInterface', ['setSpeed', 'getWheels']);

// Person object
function Person(name, lastname){
    this.name = name;
    this.lastname = lastname;
    this.age = 0;

    this.getLastname = function(){
        return lastname;
    };

    this.getAge = function(){
        return 3;
    };
}

// Car Object
function Car(){
    this.speed = 5;
    this.age = 0;

    this.getWheels = function (){
        return 4;
    };

    this.getMarket = function (){
        return "bmw";
    };

    this.setSpeed = function (a){
        this.speed = a;
        return 3;
    };

    this.getAge = function(){
        return this.age;
    };
}

var c = new Car();
var p = new Person();

// Pointcut to indetify objects that have the interface 'myInterface'
function pointcut(myInterface){
    return function(jp){
       return jp.isCall() && Interface.ensureImplements(jp.target, myInterface);
    };
}

//AFTER: at the end of Car it will meet the interface!!
AJS.after(pointcut(vehiculeInterface), function (){
    Testing.flag(-1);
});

// this execution should trigger
c.getAge();

// this execution should not trigger
p.getAge();

Testing.check(-1);
