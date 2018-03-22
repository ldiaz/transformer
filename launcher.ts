import * as vm from "vm";
import * as fs from "fs";
import * as getStdin from "get-stdin";
import {rewrite} from "./index";

declare const global;
declare const AspectScriptRewrite;

global.evaluate = function (str) {
    new vm.Script(str).runInThisContext();
};

const JP_MODEL = {
    jpNew: true,
    jpInit: true,
    jpCall: true,
    jpExec: true,
    jpPropRead: true,
    jpPropWrite: true,
    jpVarRead: false,
    jpVarWrite: false
};
const NEW = true;

console.log(fs.readFileSync("../aspectscript/aspectscript_original.ks.js", {encoding: "UTF-8"}));
console.log("var AJS = AspectScript; var PCs = AspectScript.Pointcuts;");
console.log(fs.readFileSync("../aspectscript/fw-testing.js", {encoding: "UTF-8"}));
//console.log("function print(...args){ console.log(...args); }");
console.log("function load(){ /* do nothing */ }");
console.log();

if (NEW) {
    getStdin().then(code => {
        console.log(rewrite(code));
    });
}
else {
    load("../aspectscript/jsdefs.js");
    load("../aspectscript/jsparse.js");
    load("../aspectscript/jsrewrite.js");

    getStdin().then(code => {
        console.log(AspectScriptRewrite.rewrite(code, JP_MODEL));
    });
}

function load(filename) {
    let options = {
        filename: filename,
        displayErrors: true
    };
    let source = fs.readFileSync(filename, {encoding: "UTF-8"});
    let script = new vm.Script(source, options);
    script.runInThisContext(options)
}


