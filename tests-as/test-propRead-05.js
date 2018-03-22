load("loader.js");

var i = 0;

Testing.flag(i);
Testing.flag(++i);
Testing.flag(i++);
Testing.flag(i);
Testing.flag(--i);
Testing.flag(i--);
Testing.flag(i);

var j = 0;

Testing.flag(this.j);
Testing.flag(++this.j);
Testing.flag(this.j++);
Testing.flag(this.j);
Testing.flag(--this.j);
Testing.flag(this.j--);
Testing.flag(this.j);

(function(){
    var k = 0;

    Testing.flag(k);
    Testing.flag(++k);
    Testing.flag(k++);
    Testing.flag(k);
    Testing.flag(--k);
    Testing.flag(k--);
    Testing.flag(k);
})();


Testing.check(
        0, 1, 1, 2, 1, 1, 0,
        0, 1, 1, 2, 1, 1, 0,
        0, 1, 1, 2, 1, 1, 0
        );