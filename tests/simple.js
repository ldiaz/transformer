var a;
var b = 0;
b = 1;
//var c = 0, d = 1; //supported in new version
var e = null;
e = null;
var a = c;
a = c;
//let f = 1;

// Objects

var x = {};
x = {};
var x = {"a": 1};
x = {"a": 1};
var x = {"a": 1, "b": 2};
x = {"a": 1, "b": 2};
var x = {"a": z};
x = {"a": z};
var x = {"a": z, 1: 2};
x = {"a": z, 1: 2};
//var a = {"x": (x = 1)};  //supported in new version

// Arrays

var a = [];
a = [];
var a = [1, 2, 3];
a = [1, 2, 3];
var a = [x, y, z];
a = [x, y, z];

//

a[1];
a[x];
a["x"];
a.x;
a.x.y;
a.x[1];
a.x[y];
a.x[y].z[1];
a.x[y].z[1].q;

//

new String();
new String("test");
new String("test", a);
new String("test", {"a": 1});
new String("test", {"a": 1, "b": b});
new String("test", {"a": 1, "b": b}, []);
new String("test", {"a": 1, "b": b}, [1, 2, 3]);
new String("test", {"a": 1, "b": b}, [1, 2, 3, b, c, d], x.v.b);

//

f();
f(1, 2, 3);
f({"a": 1});
f({"a": 1}, [1, 2, 3]);
f({"a": 1}, [1, 2, 3], x, y, z.a.v);

a.f();
a.f(1, 2, 3);
a.f(1, 2, 3, [], {});
a.f(1, 2, 3, [], {"a": 1});

a[f]();
a[f](1, 2, 3);
a[f](1, 2, 3, [], {});
a[f](1, 2, 3, [], {"a": 1});

a["f"]();
a["f"](1, 2, 3);
a["f"](1, 2, 3, [], {});
a["f"](1, 2, 3, [], {"a": 1});

a.b.c.f();
a.b.c.f(1, 2, 3);
a.b.c.f(1, 2, 3, [], {});
a.b.c.f(1, 2, 3, [], {"a": 1});

a.b.c[f]();
a.b.c[f](1, 2, 3);
a.b.c[f](1, 2, 3, [], {});
a.b.c[f](1, 2, 3, [], {"a": 1});

a.b.c["f"]();
a.b.c["f"](1, 2, 3);
a.b.c["f"](1, 2, 3, [], {});
a.b.c["f"](1, 2, 3, [], {"a": 1});

//

function a(x) {
}
function b(y) {
    console.log()
}
var c = function (z) {
}
function d() {
    function b() {
    }
}
function e() {
    var x = function () {
    }
}

function z(m) {
    if (1) {
        console.log(m);
    }
}

++a;
--a;
a++;
a--;

++a.b;
--a.b;
a.b++;
a.b--;

++a[0];
--a[0];
a[0]++;
a[0]--;

++a.b.c[0].d;
--a.b.c[0].d;
a.b.c[0].d++;
a.b.c[0].d--;

for (i in []) {
}

this.x = 0;
a(this.x);

node[i] = 0;

a += b;
a.b += b;
a.b[c] += b;
a.b[0].x += b.a;

for (name in options)
    console.log(name)

function b(y) {
    console.log(arguments);
}

delete a["b"];
delete a.b;
delete a[b];

if (!a && !b) {
}

try {
} catch (e) {
}