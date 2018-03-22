/// <reference path="typings/modules/babel-traverse/index.d.ts" />
/// <reference path="typings/modules/babel-types/index.d.ts" />

import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from  "babel-types";
import {Expression, Statement} from "babel-types";
import generate from "babel-generator";
import * as template from "babel-template";

import * as _ from "lodash";

const GEN_THIS = "$__this__";
const GEN_GO = "AspectScript.globalObject";

const TEMPLATES = {
    propReadGlobal: tpl("jpPropRead", `AspectScript.i13n.propRead(AspectScript.globalObject, ID)`),
    propReadObject: tpl("jpPropRead", `AspectScript.i13n.propRead(OBJ, ID)`),

    propWriteGlobal: tpl("jpPropWrite", `AspectScript.i13n.propWrite(AspectScript.globalObject, ID, VALUE)`),
    propWriteObject: tpl("jpPropWrite", `AspectScript.i13n.propWrite(OBJ, ID, VALUE)`),

    objectCreation: tpl("jpNew", `AspectScript.i13n.creation(NARGS, CTOR, [ARGS])`),

    objectLiteral: tpl("jpNew",
        `AspectScript.i13n.creation2(
        function(){
            var ${GEN_THIS} = arguments[0];
            arguments = arguments[1];
            PROPS
        }, this, ARGUMENTS)`),
    objectLiteralNoProps: tpl("jpNew", `AspectScript.i13n.creation3()`),
    arrayLiteral: tpl("jpNew", `AspectScript.i13n.creation4([ELEMS])`),

    call: tpl("jpCall", `AspectScript.i13n.call(OBJ, FUN, [ARGS], CTX)`),
    call2: tpl("jpCall", `AspectScript.i13n.call2(OBJ, FUN, [ARGS], CTX)`),

    propIncr: tpl("jpPropWrite", `AspectScript.i13n.propIncr(OBJ, ID, INCR, POSTFIX)`),

    deletion: tpl("jpPropWrite", `OBJ[ID]`),

    forIn: tplStmt(
        `for(LEFT in RIGHT){
        if (LID == '__ASPECTS__') continue;
        BODY
    }`),

    functionExpression: tpl("jpNew", //TODO: double { only for compat
        `AspectScript.i13n.wrap(
        function(){
            return (
                function(ARGS){{
                    arguments.callee = arguments.callee.wrapper;
                    BODY
                }}
            );
        }
    )`),
    functionDeclaration: tpl("jpNew", //TODO: double { only for compat
        `AspectScript.i13n.wrap(
        function(){
            return (
                function FNAME(ARGS){{
                    var FNAME = arguments.callee = arguments.callee.wrapper;
                    BODY
                }}
            );
        }
    )`)
};

//TODO: make jpModel not global
let JP_MODEL = {
    jpNew: true,
    jpInit: true,
    jpCall: true,
    jpExec: true,
    jpPropRead: true,
    jpPropWrite: true
};
type JPKind = keyof (typeof JP_MODEL);

const AspectScriptTransformerVisitor = {
    VariableDeclarator(path){
        const {node} = path;
        dbg("VariableDeclarator", toString(node));

        if (node.init == null) { //a declaration without init is not a jp
            return path.node;
        }

        if (isInsideFunction(path)) {
            path.get("init").replaceWith(visit(path.get("init")));
            path.skip();
            return path.node;
        }

        path.get("init").replaceWith(TEMPLATES.propWriteGlobal({
            ID: t.stringLiteral(node.id.name),
            VALUE: visit(path.get("init"))
        }));
        path.skip();

        return path.node;
    },
    AssignmentExpression(path) {
        const {node} = path;
        dbg("AssignmentExpression", toString(node));

        let simple = node.operator === "=";
        let left = path.get("left");

        if (t.isIdentifier(left.node)) {
            if (isLocalVar(path, left.node.name) && isInsideFunction(path)) {
                path.get("right").replaceWith(visit(path.get("right")));
            }
            else {
                path.replaceWith(TEMPLATES.propWriteGlobal({
                    ID: t.stringLiteral(node.left.name),
                    VALUE: simple ?
                        visit(path.get("right")) :
                        t.binaryExpression(node.operator[0], node.left, visit(path.get("right")))
                }));
                node.operator = "=";
            }
        }
        else {
            let property = left.get("property");
            let hack = toString(node.left);

            path.replaceWith(TEMPLATES.propWriteObject({
                OBJ: visit(left.get("object"), "4S"),
                ID: left.node.computed ? property.node : t.stringLiteral(property.node.name),
                VALUE: simple ?
                    visit(path.get("right")) :
                    t.binaryExpression(node.operator[0], t.identifier(hack), visit(path.get("right")))
            }));
            node.operator = "=";
        }

        path.skip();

        return path.node;
    },
    Identifier(path) {
        const {node, parentPath: {node: parentNode}} = path;
        const localVar = isLocalVar(path, node.name);
        dbg("Identifier", toString(parentNode), toString(node), localVar);

        if (isInsideFunction(path)) {
            if (localVar) {
                return path.node;
            }
            if (node.name == "arguments") {
                return path.node;
            }
        }

        path.replaceWith(TEMPLATES.propReadGlobal({
            ID: t.stringLiteral(node.name),
        }));
        path.skip();

        return path.node;
    },
    UpdateExpression(path){
        const {node} = path;
        dbg("UpdateExpression", toString(node));

        let argument = path.get("argument");

        if (t.isIdentifier(argument.node)) {
            if (isLocalVar(path, argument.node.name) && isInsideFunction(path)) {
                return path.node;
            }

            path.replaceWith(TEMPLATES.propIncr({
                OBJ: t.identifier(GEN_GO),
                ID: t.stringLiteral(argument.node.name),
                INCR: t.numericLiteral(node.operator == "--" ? -1 : +1),
                POSTFIX: t.booleanLiteral(!node.prefix)
            }));
        }
        else {
            let property = argument.get("property");
            path.replaceWith(TEMPLATES.propIncr({
                OBJ: visit(argument.get("object")),
                ID: t.isLiteral(property.node) ? property.node : t.stringLiteral(property.node.name),
                INCR: t.numericLiteral(node.operator == "--" ? -1 : +1),
                POSTFIX: t.booleanLiteral(!node.prefix)
            }));
        }

        path.skip();

        return path.node;
    },
    UnaryExpression(path){
        const {node} = path;
        dbg("UnaryExpression", toString(node));

        if (node.operator == "delete") {
            let property = node.argument.property;

            path.get("argument").replaceWith(TEMPLATES.deletion({
                OBJ: visit(path.get("argument").get("object")),
                ID: node.argument.computed ? property : t.stringLiteral(property.name)
            }));
        }
        else {
            path.get("argument").replaceWith(visit(path.get("argument")));
        }
        path.skip();

        return path.node;
    },
    ObjectExpression(path){
        const {node} = path;
        dbg("ObjectExpression", toString(node), isInsideFunction(path));

        if (_.isEmpty(node.properties)) {
            path.replaceWith(TEMPLATES.objectLiteralNoProps());
        }
        else {
            path.replaceWith(TEMPLATES.objectLiteral({
                PROPS: _.map(node.properties, function (prop, idx) {
                    return TEMPLATES.propWriteObject({
                        OBJ: t.identifier(GEN_THIS),
                        ID: t.isStringLiteral(prop.key) ? prop.key : t.stringLiteral(prop.key.name || String(prop.key.value)),
                        VALUE: visit(path.get("properties." + idx).get("value"))
                    })
                }),
                ARGUMENTS: t.identifier(isInsideFunction(path) ? "arguments" : "null")
            }));
        }

        path.skip();

        return path.node;
    },
    ArrayExpression(path) {
        const {node} = path;
        dbg("ArrayExpression", toString(node));

        path.replaceWith(TEMPLATES.arrayLiteral({
            ELEMS: _.map(node.elements, function (elem, idx) {
                return visit(path.get("elements." + idx));
            })
        }));
        path.skip();

        return path.node;
    },
    MemberExpression(path) {
        const {node} = path;
        dbg("MemberExpression", toString(node), node.computed);

        path.replaceWith(TEMPLATES.propReadObject({
            OBJ: visit(path.get("object")),
            ID: node.computed ? visit(path.get("property")) : t.stringLiteral(node.property.name)
        }));
        path.skip();

        return path.node;
    },
    NewExpression(path){
        const {node} = path;
        dbg("NewExpression", toString(node));

        path.replaceWith(TEMPLATES.objectCreation({
            NARGS: t.numericLiteral(node.arguments ? node.arguments.length : 0),
            CTOR: visit(path.get("callee")),
            ARGS: _.map(node.arguments, function (elem, idx) {
                return visit(path.get("arguments." + idx));
            })
        }));
        path.skip();

        return path.node;
    },
    CallExpression(path){
        const {node} = path;
        dbg("CallExpression", toString(node));

        let callee = path.get("callee");

        if (t.isMemberExpression(callee.node)) {
            path.replaceWith(TEMPLATES.call2({
                OBJ: visit(callee.get("object"), "object"),
                FUN: callee.node.computed ? visit(callee.get("property")) : t.stringLiteral(callee.node.property.name),
                ARGS: _.map(node.arguments, function (elem, idx) {
                    return visit(path.get("arguments." + idx));
                }),
                CTX: t.identifier("this")
            }));
        }
        else {
            path.replaceWith(TEMPLATES.call({
                OBJ: t.identifier(GEN_GO),
                FUN: visit(callee, "fun"),
                ARGS: _.map(node.arguments, function (elem, idx) {
                    return visit(path.get("arguments." + idx));
                }),
                CTX: t.identifier("this")
            }));
        }

        path.skip();

        return path.node;
    },
    FunctionExpression(path){
        const {node} = path;
        dbg("FunctionExpression", toString(node));

        node.body.body = sortStatements(node.body.body);

        path.replaceWith(TEMPLATES.functionExpression({
            ARGS: node.params,
            BODY: visit(path.get("body")).body
        }));
        path.skip();

        return path.node;
    },
    FunctionDeclaration(path){
        const {node} = path;
        dbg("FunctionDeclaration", toString(node), node.body);

        node.body.body = sortStatements(node.body.body);

        let replacement = TEMPLATES.functionDeclaration({
            FNAME: node.id,
            ARGS: node.params,
            BODY: visit(path.get("body")).body
        });

        path.replaceWith(t.variableDeclaration("var", [t.variableDeclarator(node.id, replacement)]));
        path.skip();

        return path.node;
    },
    //
    ForInStatement(path){
        const {node} = path;
        dbg("ForInStatement", toString(node));

        path.replaceWith(TEMPLATES.forIn({
            LEFT: node.left,
            LID: t.isIdentifier(node.left) ? node.left : node.left.declarations[0].id,
            RIGHT: visit(path.get("right"), "r"),
            BODY: visit(path.get("body"))
        }));
        path.skip();

        return path.node;
    },
    //special cases
    CatchClause(path){
        //skip exception reference
        path.get("body").replaceWith(visit(path.get("body")));
        path.skip();

        return path.node;
    }
};

//TODO: publish to npm registry and test the transformer as a babel plugin
const BabelPluginVisitor = {
    Program(path, state: any = {}){
        if (_.isObject(state.jpModel)) {
            let jpModel = state.jpModel;
            JP_MODEL = {...JP_MODEL, ...jpModel};
        }

        const {node} = path;

        node.body = sortStatements(node.body);
        node.body = _.each(node.body, function (p, idx) {
            node.body[idx] = visit(path.get("body." + idx))
        });
    }
};

export default function ({types: t}) {
    return BabelPluginVisitor;
}

export function rewrite(code, options: any = {}) {
    if (_.isObject(options.jpModel)) {
        let jpModel = options.jpModel;
        JP_MODEL = {...JP_MODEL, ...jpModel};
    }

    const ast = babylon.parse(code);
    traverse(ast, BabelPluginVisitor);
    return generate(ast, {}, code).code;
}

function visit(path, msg = "") {
    //dbg("--> node", path, path.node, msg);
    dbg("--> visit", path.node.type, msg);

    if (AspectScriptTransformerVisitor[path.node.type]) {
        return AspectScriptTransformerVisitor[path.node.type](path);
    }
    else {
        _.each(path.node, (value, key) => {
            if (value == null) {
                return;
            }

            if (_.includes(["type", "start", "end", "loc", "extra", "leadingComments"], key)) {
                return;
            }

            dbg("key:", key);
            if (_.isArray(value) && value.length > 0 && _.isString(value[0].type)) {
                _.each(value, function (v, idx) {
                    value[idx] = visit(path.get(key + "." + idx));
                });
            }
            if (_.isString(value.type)) {
                path.node[key] = visit(path.get(key));
            }
        });

        return path.node;
    }
}

// util

function sortStatements(body) {
    return _.sortBy(body, function (node) {
        if (t.isFunctionDeclaration(node)) {
            return 0;
        }

        return Number.MAX_VALUE;
    });
}

function tpl(jpKind: JPKind, code): (object?) => Expression {
    const t = template(code);
    return function (bindings) {
        //dbg("--> tpl", ...bindings);
        let expression = t(bindings).expression;
        dbg("--> tpl", toString(expression));
        return expression;
    }
}

function tplStmt(code): (object?) => Statement {
    //dbg("compiling", code);

    const t = template(code);
    return function (bindings) {
        //dbg("--> tpl", ...bindings);
        let statement = t(bindings);
        dbg("--> tpl", toString(statement));
        return statement;
    }
}

function isInsideFunction(path) {
    return t.isFunction(path.getFunctionParent());
}

function isLocalVar(path, name) {
    return path.scope.hasBinding(name, true);
}

function toString(ast) {
    return generate(ast, {}, "").code;
}

function dbg(...args) {
    //console.log.apply(console, args);
}
