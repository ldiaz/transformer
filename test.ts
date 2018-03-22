import * as fs from "fs";
import * as vm from "vm";
import * as _ from "lodash";

import * as babylon from "babylon";
import generate from "babel-generator";

import * as colors from 'colors/safe';
import * as diff from 'diff';
import * as prettier  from "prettier";

import {rewrite} from "./index";

declare const process;
declare const global;
declare const AspectScriptRewrite;

let JP_MODEL = {
    jpNew: true,
    jpInit: true,
    jpCall: true,
    jpExec: true,
    jpPropRead: true,
    jpPropWrite: true,
    jpVarRead: false,
    jpVarWrite: false
};

global.evaluate = function (str) {
    new vm.Script(str).runInThisContext();
};

function load(filename) {
    let options = {
        filename: filename,
        displayErrors: true
    };
    let source = fs.readFileSync(filename, {encoding: "UTF-8"});
    let script = new vm.Script(source, options);
    script.runInThisContext(options)
}

load("aspectscript/jsdefs.js");
load("aspectscript/jsparse.js");
load("aspectscript/jsrewrite.js");

let code = `
try{}catch(e){}
 `;
let codeWithinFunc = `function main() {
    ${code}
}`;
//code = codeWithinFunc;

console.log("-- CODE ------------------------------------------------------");
console.log(code);
console.log("-- AS --------------------------------------------------------");
let b;
try {
    b = AspectScriptRewrite.rewrite(code, JP_MODEL);
    console.log(b);
} catch (e) {
    console.log("error", e);
}
console.log("-- TR --------------------------------------------------------");
let a = rewrite(code, {jpModel: JP_MODEL});
console.log(a);
console.log("-- EQUAL? --------------------------------------------------------");
console.log(goAndBack(a) === goAndBack(b));


if (process.argv[2] != "--tests") {
    process.exit();
}

console.log("--------------------------------------------------------");

const ENC = {encoding: "UTF-8"};
fs.writeFileSync("tests/simple-main.js", "function main(){\n" + fs.readFileSync("tests/simple.js", ENC) + "\n}", ENC);

let files = fs.readdirSync("tests");
if (process.argv[3] == "--simple") {
    files = ["simple.js", "simple-main.js"]
}

_.each(files, function (file) {
    console.log("checking file", file);
    let code = fs.readFileSync("tests/" + file, ENC);

    let resultAS;
    try {
        resultAS = goAndBack(AspectScriptRewrite.rewrite(code, JP_MODEL));
    }
    catch (err) {
        console.log("***************************************");
        console.log("**** error while transforming *********")
        console.log(err);
        console.log("***************************************");
    }
    let resultTR = goAndBack(rewrite(code, {jpModel: JP_MODEL}));

    if (!resultAS) {
        console.log("AS transformer failed"); //AS fallo, no hay como comparar
        console.log(resultTR);
        return;
    }

    if (resultAS != resultTR) {
        console.log("-- AS ------------------------------------------------------");
        fs.writeFileSync("temp/as.js", prettier.format(resultAS, {parser: "flow"}), ENC);
        //console.error(resultAS);
        console.log("-- TR ------------------------------------------------------");
        fs.writeFileSync("temp/tr.js", prettier.format(resultTR, {parser: "flow"}), ENC);
        //console.error(resultTR);
        console.log("--------------------------------------------------------");

        let differences = diff.diffChars(resultAS, resultTR);

        differences.forEach(function (part) {
            let color = part.added ? 'yellow' : part.removed ? 'red' : 'grey';
            //if(part.added || part.removed)
            process.stderr.write(colors[color](part.value));
        });

        return false;
    }
});

function goAndBack(code) {
    let parse;
    try {
        parse = babylon.parse(code);
    }
    catch (err) {
        console.log("*****************************");
        console.log("**** error while parsing ****");
        console.log("*****************************");
        console.log(code);
        throw err;
    }
    return generate(parse, {compact: true, comments: false}, code).code;
}