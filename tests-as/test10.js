load("loader.js");

function Person(name, lastName) {
    this.name = name;
    this.lastname = lastName;

    this.getName = function() {
        return this.name;
    };

    function getLastName() {
        return lastName;
    }

    this.toString = function() {
        return this.name + getLastName();
    };

    AJS.before(PCs.exec(getLastName), function () {
        Testing.flag(-3);
    });
}

AJS.before(PCs.exec("getName"), function () {
    Testing.flag(-2);
});


AJS.before(PCs.init(Person), function () {
    Testing.flag(-1);
});

var paul = new Person("pedro","perez");
paul.getName();
paul.toString();

Testing.check(-1,-2,-3);