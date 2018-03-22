load("loader.js");

(function(){

    var window = this;
    var j = {};
    window.j = j;

    j.extend = function(fields){
        var target = this;

        for(x in {}){
        }

        for(var f in fields){
            target[f] = fields[f];
        }
    };

    j.extend({each: "each"});

})();

if(j.each == "each"){
    Testing.flag("ok");
}

Testing.check("ok");


