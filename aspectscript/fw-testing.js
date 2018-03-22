function show(msg) {
    var mode = 3;
    switch (mode) {
        case 1:
            print("// " + msg);
            break;
        case 2:
            alert(msg);
            break;
        case 3:
            console.log(msg);
            break;
    }
}


var Testing = {
    flags: [],

    flag: function (msg) {
        this.flags.push(msg.toString());
    },

    check: function () {
        if (arguments.length != this.flags.length) {
            this.report(arguments, this.flags);
        }
        else {
            for (var i = 0; i < arguments.length; ++i) {
                if (arguments[i].toString() !== this.flags[i]) {
                    this.report(arguments, this.flags);
                }
            }
        }
    },

    report: function (a1, a2) {
        show("Test failed:");
        show("expected:");
        this.showArray(a1);
        show("result:");
        this.showArray(a2);
        //quit();
    },

    showArray: function (array) {
        if (array.length == 0) {
            show("<empty array>");
        }
        else {
            var aux = "";
            for (var i = 0; i < array.length; ++i) {
                aux += (array[i] + " ");
            }
            show(aux);
        }
    },

    assert: function (condition) {
        if (!eval(condition)) {
            show("Test failed");
            show(condition);
        }
    },

    assert2: function (msg, condition) {
        if (!condition) {
            show("Test failed");
            show(msg);
        }
    }
};