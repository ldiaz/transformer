var AspectScriptRewrite = function (){

    function dbg(m){
        if(false){
            eval("document.getElementById(\"parsing\").innerHTML += m + '\\n'");
        }
        else{
            console.log(m);
            //print(m);
        }
    }

    function Constructor(){

        JSParser.Node.prototype.accept = function(visitor){
            return visitor.visit(this);
        };

        var recursiveVisitor = {
            visit : function(node){
                var i;

                if(node.type == JSParser.SCRIPT){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.FUNCTION){
                    node.body = node.body.accept(this);
                    return node;
                }

                if(node.type == JSParser.NEW || node.type == JSParser.NEW_WITH_ARGS){
                    node[0] = node[0].accept(this);
                    if(node.type == JSParser.NEW_WITH_ARGS){
                        node[1] = node[1].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.OBJECT_INIT){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.ARRAY_INIT){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.ASSIGN){
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.VAR){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.IDENTIFIER){
                    if(node.initializer){
                        node.initializer = node.initializer.accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.CALL){
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.WITH){
                    throw "with is not supported";
                }

                if(node.type == JSParser.INCREMENT || node.type == JSParser.DECREMENT){
                    node[0] = node[0].accept(this);
                    return node;
                }

                if(node.type == JSParser.DOT){  //obj.methodName
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.SEMICOLON){
                    if(node.expression){
                        node.expression = node.expression.accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.PROPERTY_INIT){
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.GROUP){ // parens
                    node[0] = node[0].accept(this);
                    return node;
                }

                if(node.type == JSParser.LIST){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.FOR_IN){
                    //dbg(node);
                    if(node.varDecl != null){
                        node.varDecl = node.varDecl.accept(this);
                    }
                    node.object = node.object.accept(this); //expr
                    node.body = node.body.accept(this);
                    return node;
                }

                if(node.type == JSParser.FOR){
                    if(node.setup){
                        node.setup = node.setup.accept(this);
                    }
                    if(node.condition){
                        node.condition = node.condition.accept(this);
                    }
                    if(node.update){
                        node.update = node.update.accept(this);
                    }
                    node.body = node.body.accept(this);
                    return node;
                }

                if(node.type == JSParser.WHILE || node.type == JSParser.DO){
                    node.condition = node.condition.accept(this);
                    node.body = node.body.accept(this);
                    return node;
                }

                if(node.type == JSParser.TRY){
                    node.tryBlock = node.tryBlock.accept(this);
                    for(i in node.catchClauses){
                        if(i == "top"){ //narcissus adds this method to Node?
                            continue;
                        }
                        node.catchClauses[i] = node.catchClauses[i].accept(this);
                    }
                    if(node.finallyBlock){
                        node.finallyBlock = node.finallyBlock.accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.CATCH){
                    node.block = node.block.accept(this);
                    return node;
                }

                if(node.type == JSParser.IN){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.ARRAY_INIT){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.BLOCK){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.TYPEOF){
                    node[0] = node[0].accept(this);
                    return node;
                }

                if(node.type == JSParser.INSTANCEOF){
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.DELETE){
                    node[0] = node[0].accept(this);
                    return node;
                }

                if(node.type == JSParser.COMMA){
                    for(i = 0; i < node.length; ++i){
                        node[i] = node[i].accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.EQ || node.type == JSParser.NE || node.type == JSParser.STRICT_EQ || node.type == JSParser.STRICT_NE ||
                   node.type == JSParser.LE || node.type == JSParser.LT || node.type == JSParser.GT || node.type == JSParser.GE ||
                   node.type == JSParser.PLUS || node.type == JSParser.MINUS || node.type == JSParser.MOD ||
                   node.type == JSParser.MUL || node.type == JSParser.DIV ||
                   node.type == JSParser.RSH || node.type == JSParser.LSH || node.type == JSParser.URSH ||
                   node.type == JSParser.AND || node.type == JSParser.OR ||
                   node.type == JSParser.BITWISE_OR || node.type == JSParser.BITWISE_AND || node.type == JSParser.BITWISE_XOR){
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.NOT || node.type == JSParser.UNARY_PLUS || node.type == JSParser.UNARY_MINUS){
                    node[0] = node[0].accept(this);
                    return node;
                }

                if(node.type == JSParser.RETURN){
                    if(node.value != "return"){
                        //display.innerHTML += node + "\n";
                        node.value = node.value.accept(this);
                    }
                    return node;
                }

                if(node.type == JSParser.IF){
                    node.condition = node.condition.accept(this);
                    node.thenPart = node.thenPart.accept(this);
                    if(node.elsePart){
                        node.elsePart = node.elsePart.accept(this);
                    }

                    return node;
                }

                if(node.type == JSParser.HOOK){  // a? b : c;
                    node[0] = node[0].accept(this);  //a
                    node[1] = node[1].accept(this);  //b
                    node[2] = node[2].accept(this);  //c
                    return node;
                }

                if(node.type == JSParser.THROW){
                    node.exception = node.exception.accept(this);
                    return node;
                }

                if(node.type == JSParser.SWITCH){
                    node.discriminant = node.discriminant.accept(this);

                    for(i in node.cases){
                        if(i == "top"){ //narcissus adds this method to Node?
                            continue;
                        }
                        node.cases[i] = node.cases[i].accept(this);
                    }

                    return node;
                }

                if(node.type == JSParser.LABEL){
                    node.statement = node.statement.accept(this);
                    return node;
                }

                if(node.type == JSParser.CASE){
                    node.caseLabel = node.caseLabel.accept(this);
                    node.statements = node.statements.accept(this);
                    return node;
                }

                if(node.type == JSParser.DEFAULT){
                    node.statements = node.statements.accept(this);
                    return node;
                }

                if(node.type == JSParser.INDEX){ //array access
                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    return node;
                }

                if(node.type == JSParser.THIS ||
                   node.type == JSParser.STRING || node.type == JSParser.NUMBER || node.type == JSParser.NULL || node.type == JSParser.REGEXP ||
                   node.type == JSParser.BREAK || node.type == JSParser.CONTINUE ||
                   node.type == JSParser.TRUE || node.type == JSParser.FALSE){
                    //do nothing
                    return node;
                }

                dbg("weaver: " + node);
            }
        };

        // --- Generation ---

        function CodeGenerationVisitor(jpModel){

            var ppVisitor = new PPVisitor();

            function isCall(node, options){
                var pp = node.accept(ppVisitor);

                return options.some(function(option){
                    var lop = option.length;
                    if(lop > pp.length){
                        return false;
                    }

                    return option == pp.substring(0, lop);
                });
            }

            //todo do the same we did in isAspectScriptCall
            function isLoadCall(node){
                return isCall(node, [
                    "load(\"loader.js\")",
                    "load(\"loader-ds.js\")",
                    "load(\"loader-etm.js\")"
                ]);
            }

            //lexical filter, AspectScritp.call also check this
            //todo: what about security?
            //todo: remove this?
            function isAspectScriptCall(node){
                return isLoadCall(node) ||
                       isCall(node, [
                           //"AspectJS.",
                           //"AJS.",
                           //"PCs.",
                           //"AspectJS.Pointcuts.",
                           //"Pointcuts.",
                           //"Testing.",
                           //"Benchs.",
                           //"TraceMatch.",
                           //"TM.",
                           //"print("
                       ]);
            }

            function reorderFunctions(node){
                var array = [];
                var i;
                for(i = 0; i < node.length; ++i){
                    array[i] = node[i];
                }

                //load calls (for testing) first, then functions, and finally everything else
                array.sort(function(a, b){
                    if(a.type == b.type){
                        return a.start - b.start;
                    }

                    if(isLoadCall(a)){
                        return -1;
                    }

                    if(isLoadCall(b)){
                        return 1;
                    }

                    if(a.type == JSParser.FUNCTION){
                        return -1;
                    }
                    if(b.type == JSParser.FUNCTION){
                        return 1;
                    }

                    return a.start - b.start;
                });

                for(i = 0; i < node.length; ++i){
                    node[i] = array[i];
                }
            }

            var nodeStack = [];

            function inside(type){
                return stackParent(-1, type);
            }

            function stackParent(depth, type){
                if(depth == -1){
                    for(var i = nodeStack.length - 2; i >= 0; --i){
                        if(nodeStack[i].type == type){
                            return true;
                        }
                    }

                    return false;
                }
                else{
                    if(nodeStack.length <= depth){
                        return false;
                    }

                    return nodeStack[nodeStack.length - 1 - depth].type == type;
                }
            }

            function getObjectAndProp(node){
                if(node[0].type == JSParser.DOT || node[0].type == JSParser.INDEX){
                    var v = null; //variable being accessed
                    var o = null; //variable's owner

                    if(node[0].type == JSParser.DOT){  //a.b.c.d style
                        v = node[0];
                        while(v.type == JSParser.DOT){
                            o = v[0];
                            v = v[1];
                        }
                    }
                    if(node[0].type == JSParser.INDEX){ //array style
                        o = node[0][0];
                        v = node[0][1]; //index (can be anything)
                    }

                    return [o, v];
                }

                return null;
            }

            function getArgsList(visitor, node){
                //if there are args
                if(node.length > 0){
                    var list = {
                        length: node.length
                    };
                    for(var i = 0; i < node.length; ++i){
                        list[i] = node[i].accept(visitor);
                    }
                    return new ChameleonNode(JSParser.ARRAY_INIT, list);
                }
                //otherwise
                else{
                    return new ChameleonNode(JSParser.ARRAY_INIT, {
                        length: 0
                    });
                }
            }

            function localVar(varName){
                var i;
                for(i = variablesStack.length - 1; i > 0; --i){
                    if(variablesStack[i].indexOf(varName) >= 0){
                        return true;
                    }
                }

                //arguments
                if(inside(JSParser.FUNCTION) && varName == "arguments"){
                    return true;
                }

                //vars in catch
                if(inside(JSParser.CATCH)){
                    for(i = nodeStack.length - 1; i >= 0; --i){
                        var c = nodeStack[i];
                        if(c.type == JSParser.CATCH){
                            if(c.varName === varName){
                                return true;
                            }
                            //continue for other catchs
                        }
                    }
                }

                return false;
            }

            var variablesStack = [];

            this.visit = function(node){

                var actualVisit = function(node){
                    var i, list, inner, varName, value, o, v;

                    if(node.type == JSParser.SCRIPT){
                        //dbg(node)
                        //the order of functions should be modified only in top-level declarations and
                        //in functions bodies (these have type == SCRIPT)
                        reorderFunctions(node);

                        //collect var declarations
                        var varCollector = new VarCollectorVisitor(nodeStack);
                        node.accept(varCollector);
                        variablesStack.push(varCollector.vars());
                        //dbg(variablesStack);

                        for(i = 0; i < node.length; ++i){
                            node[i] = node[i].accept(this);
                        }

                        variablesStack.pop();
                        return node;
                    }

                    // Functions

                    if(node.type == JSParser.FUNCTION){
                        node.body = node.body.accept(this);
                        if(node.name){
                            var name = node.name;

                            //we override arguments.callee to avoid access to the wrapped function
                            //(the var declaration hides the variable that also allows access to it)
                            node.body = new WrapperNode(
                                    "{" +
                                    "var " + name + " = arguments.callee = arguments.callee.wrapper;",
                                    node.body,
                                    "}");

                            //if we are inside a variable declaration, don't declare another one
                            //(the function name is lost, but it doesn't matter)
                            if((stackParent(1, JSParser.IDENTIFIER) && stackParent(2, JSParser.VAR)) ||
                                //the same for returns
                               stackParent(1, JSParser.RETURN)){
                                return new WrapperNode("AspectScript.i13n.wrap(function(){return (", node, ")})");
                            }
                            else{
                                //without var => globally visible
                                if(!jpModel.jpVarWrite){
                                    return new WrapperNode("var " + name + " = AspectScript.i13n.wrap(function(){return (", node, ")});");
                                }
                                else{
                                    return new WrapperNode(
                                            "var " + name + " = AspectScript.i13n.varWrite(" +
                                            "\"" + name + "\"," +
                                            "AspectScript.i13n.wrap(function(){return (", node, ")}),undefined);");
                                }
                            }
                        }
                        else{
                            //we override arguments.callee to avoid access to the wrapped function
                            node.body = new WrapperNode(
                                    "{" +
                                    "arguments.callee = arguments.callee.wrapper;",
                                    node.body,
                                    "}");
                            return new WrapperNode("AspectScript.i13n.wrap(function(){return (", node, ")})");
                        }
                    }

                    // New

                    if(node.type == JSParser.NEW || node.type == JSParser.NEW_WITH_ARGS){
                        var konstructor = node[0].accept(this);

                        var nArgs = 0;
                        if(node.type == JSParser.NEW){
                            list = {length: 0};
                        }
                        else{
                            nArgs = node[1].length;
                            list = {length: node[1].length};

                            for(i = 0; i < node[1].length; ++i){
                                list[i] = node[1][i].accept(this);
                            }
                        }

                        inner = new ChameleonNode(JSParser.LIST, {
                            length: 3,
                            0: getConstantValueNode(nArgs + ""),
                            1: konstructor,
                            2: new ChameleonNode(JSParser.ARRAY_INIT, list)
                        });

                        return new WrapperNode("AspectScript.i13n.creation(", inner, ")");
                    }

                    if(node.type == JSParser.OBJECT_INIT){
                        var initText = "";
                        for(i = 0; i < node.length; ++i){
                            //transform property init
                            node[i] = node[i].accept(this);

                            fName = (node[i][0].type == JSParser.STRING) ? node[i][0].value : "\"" + node[i][0].value + "\"";
                            initText += "AspectScript.i13n.propWrite($__this__, " + fName + "," + node[i][1].accept(ppVisitor) + ");";
                        }

                        var aux = inside(JSParser.FUNCTION) ? "arguments" : "null";
                        return getConstantValueNode(
                                (node.length == 0) ? //optimize "{}" case
                                "AspectScript.i13n.creation3()" :
                                "AspectScript.i13n.creation2(function(){var $__this__=arguments[0];arguments=arguments[1];" + initText + "},this," + aux + ")");
                    }

                    if(node.type == JSParser.ARRAY_INIT){
                        list = {length: node.length};

                        for(i = 0; i < node.length; ++i){
                            list[i] = node[i].accept(this);
                        }

                        inner = new ChameleonNode(JSParser.LIST, {
                            length: 1,
                            0: new ChameleonNode(JSParser.ARRAY_INIT, list)
                        });

                        return new WrapperNode("AspectScript.i13n.creation4(", inner, ")");
                    }

                    // Assignments

                    if(node.type == JSParser.ASSIGN){
                        //field write (for sure)
                        var objAndProp = getObjectAndProp(node);
                        if(objAndProp != null){
                            o = objAndProp[0];
                            v = objAndProp[1];

                            //enclose indentifier between "'s if its a.b.c style
                            if(node[0].type == JSParser.DOT){
                                v = new ChameleonNode(JSParser.STRING, {
                                    value: v.value
                                });
                            }

                            value = node[1].accept(this);
                            //if we have something like +=, update value acordingly (node[0] + value)
                            if(node.value != "="){
                                //EQ is just a trick
                                value = new ChameleonNode(JSParser.EQ, {
                                    value: node.value,
                                    0: node[0],
                                    1: value
                                });
                            }

                            inner = new ChameleonNode(JSParser.LIST, {
                                length: 3,
                                0: o.accept(this),
                                1: v,
                                2: value
                            });

                            return new WrapperNode("AspectScript.i13n.propWrite(", inner, ")");
                        }
                        //var write (declarations below)
                        else{
                            if(node[0].type == JSParser.IDENTIFIER){ // v = ...

                                var backup = value = node[1].accept(this);
                                //if we have something like +=, update value acordingly (node[0] + value)
                                if(node.value != "="){
                                    value = new ChameleonNode(JSParser.EQ, {
                                        //EQ is just a trick
                                        value: node.value,
                                        0: node[0],
                                        1: value
                                    });
                                }

                                varName = node[0].value;

                                if(localVar(varName)){
                                    if(!jpModel.jpVarWrite){
                                        //fix: "backup" is necessary because the transfo is not functional
                                        node[1] = backup;
                                        return node;
                                    }
                                    return new WrapperNode(
                                            varName + " = AspectScript.i13n.varWrite(\"" + varName + "\", ",
                                            value,
                                            ", " + varName + ")");
                                }
                                else{
                                    return new WrapperNode(
                                            "AspectScript.i13n.propWrite(" +
                                            "AspectScript.globalObject, \"" + varName + "\", ", value,
                                            ")");
                                }
                            }
                        }
                    }

                    //var declaration

                    if(node.type == JSParser.VAR){
                        for(i = 0; i < node.length; ++i){
                            //node[i] is an identifier
                            varName = node[i].value;

                            if(node[i].initializer){
                                //a var in a function is always local
                                if(inside(JSParser.FUNCTION)){
                                    if(!jpModel.jpVarWrite){
                                        node[i].initializer = node[i].initializer.accept(this);
                                    }
                                    else{
                                        node[i].initializer = new WrapperNode(
                                                "(AspectScript.i13n.varWrite(\"" + varName + "\", ",
                                                node[i].initializer.accept(this),
                                                ", undefined))");
                                    }
                                }
                                //a var in global code is always global
                                else{
                                    //todo: check
                                    //return new WrapperNode(
                                    //        "var " + varName + ";" + //decl
                                    node[i].initializer = new WrapperNode(
                                            "AspectScript.i13n.propWrite(AspectScript.globalObject, \"" + varName + "\", ",
                                            node[i].initializer.accept(this),
                                            ")");
                                }
                            }
                            else{
                                //do nothing: a var declaration without an initializer is not in our jp model
                            }
                        }

                        return node;
                    }

                    //this is only for "x" ("x = ..." is handled in ASSIGN)
                    if(node.type == JSParser.IDENTIFIER){
                        varName = node.value;

                        //todo: fix this
                        if(varName == "load"){
                            return node;
                        }

                        if(localVar(varName)){
                            if(!jpModel.jpVarRead){
                                return node;
                            }

                            return getConstantValueNode("(AspectScript.i13n.varRead(\"" + varName + "\"," + varName + "))");
                        }
                        else{
                            return getConstantValueNode("AspectScript.i13n.propRead(AspectScript.globalObject,\"" + varName + "\")");
                        }
                    }

                    if(node.type == JSParser.INDEX){ //array access
                        inner = new ChameleonNode(JSParser.LIST, {
                            length: 2,
                            0: node[0].accept(this), //recursive call
                            1: node[1].accept(this)
                        });

                        return new WrapperNode("AspectScript.i13n.propRead(", inner, ")");
                    }

                    // call

                    if(node.type == JSParser.CALL){
                        if(isAspectScriptCall(node)){
                            node[0] = node[0].accept(this); //fun
                            node[1] = node[1].accept(this); //args
                            return node;
                        }

                        if(node.accept(ppVisitor).substr(0, 19) == "AspectScript.event("){
                            node[1][3] = getConstantValueNode("this");
                            node[1].length = 4;

                            //dbg(node)
                            return node;
                        }

                        var target, fun, args;

                        //o.m(args)
                        if(node[0].type == JSParser.DOT){
                            //dbg(node);
                            target = node[0][0].accept(this);
                            var fName = new ChameleonNode(JSParser.STRING, {
                                value: node[0][1].value
                            });

                            args = getArgsList(this, node[1]);

                            inner = new ChameleonNode(JSParser.LIST, {
                                length: 4,
                                0: target,
                                1: fName,
                                2: args,
                                3: getConstantValueNode("this")
                            });

                            //call2: obj is guaranted to be non-null
                            //(the propread for the method access is done inside call2)
                            return new WrapperNode("AspectScript.i13n.call2(", inner, ")");
                        }
                        //f(args)
                        else{
                            //dbg(node)
                            var callType;
                            if(node[0].type == JSParser.INDEX){ //a[*]();
                                //the index could be any expression, so call2 is necessary
                                callType = "call2";
                                target = node[0][0].accept(this);
                                fun = node[0][1].accept(this);
                            }
                            else{
                                callType = "call";
                                target = new ChameleonNode(JSParser.NULL, {
                                    value: "AspectScript.globalObject"
                                });
                                fun = node[0].accept(this);
                            }

                            args = getArgsList(this, node[1]);

                            inner = new ChameleonNode(JSParser.LIST, {
                                length: 4,
                                0: target,
                                1: fun,
                                2: args,
                                3: getConstantValueNode("this")
                            });
                            return new WrapperNode("AspectScript.i13n." + callType + "(", inner, ")");
                        }
                    }

                    // ++i
                    //obj.c = 0
                    //++obj.c                      => get set (the expr returns 1)
                    //fw(obj, "c", obj.c + 1)      => get (aspect gets 1) (proceed set) (the expr returns 1)
                    //
                    // i++
                    //obj.c = 0
                    //obj.c++                      => get set (the expr returns 0)
                    //fw(obj, "c", obj.c + 1) - 1  => get (aspect gets 1) (proceed set) (the expr returns 0)

                    // --i
                    //obj.c = 0
                    //--obj.c                      => get set (the expr returns -1)
                    //fw(obj, "c", obj.c - 1)      => get (aspect gets -1) (proceed set) (the expr returns -1)
                    //
                    // i--
                    //obj.c = 0
                    //obj.c--                      => get set (the expr returns 0)
                    //fw(obj, "c", obj.c - 1) + 1  => get (aspect gets -1) (proceed set) (the expr returns 0)
                    if(node.type == JSParser.INCREMENT || node.type == JSParser.DECREMENT){
                        var incr = (node.type == JSParser.INCREMENT) ? +1 : -1;
                        var incrTxt = (node.type == JSParser.INCREMENT) ? "+1" : "-1";

                        //var
                        if(node[0].type == JSParser.IDENTIFIER){
                            varName = node[0].value;

                            if(localVar(varName)){
                                if(!jpModel.jpVarWrite){
                                    return node;
                                }

                                if(node.postfix){
                                    return getConstantValueNode(
                                            "((" + varName + " = (AspectScript.i13n.varWrite(\"" + varName + "\"," + varName + incrTxt + ")))" +
                                            " + (" + -incr + "))");
                                }
                                else{
                                    return getConstantValueNode(
                                            "(" + varName + " = AspectScript.i13n.varWrite(\"" + varName + "\"," + varName + incrTxt + "))");
                                }
                            }
                            else{
                                //obj, prop, incr, postfix
                                inner = new ChameleonNode(JSParser.LIST, {
                                    length: 4,
                                    0: getConstantValueNode("AspectScript.globalObject"),
                                    1: new ChameleonNode(JSParser.STRING, {value: varName}),  //prop name
                                    2: new ChameleonNode(JSParser.NUMBER, {value: incr}), // incr
                                    3: new ChameleonNode(JSParser.NULL, {value: node.postfix !== undefined}) //NULL is a trick
                                });

                                return new WrapperNode("AspectScript.i13n.propIncr(", inner, ")");
                            }
                        }
                        //prop
                        else{
                            var x = getObjectAndProp(node);
                            o = x[0];
                            v = x[1];

                            //enclose indentifier between "'s if its a.b.c style
                            if(node[0].type == JSParser.DOT){
                                v = new ChameleonNode(JSParser.STRING, {
                                    value: v.value
                                });
                            }

                            //obj, prop, incr, postfix
                            inner = new ChameleonNode(JSParser.LIST, {
                                length: 4,
                                0: o.accept(this), //all prop reads but not the last one
                                1: v,  //prop name
                                2: new ChameleonNode(JSParser.NUMBER, {value: incr}), // incr
                                3: new ChameleonNode(JSParser.NULL, {value: node.postfix !== undefined}) //NULL is a trick
                            });

                            return new WrapperNode("AspectScript.i13n.propIncr(", inner, ")");
                        }
                    }

                    //property read
                    if(node.type == JSParser.DOT){  //obj.methodName
                        inner = new ChameleonNode(JSParser.LIST, {
                            length: 2,
                            0: node[0].accept(this), //recursive call for other reads
                            1: new ChameleonNode(JSParser.STRING, {value: node[1].value})
                        });

                        return new WrapperNode("AspectScript.i13n.propRead(", inner, ")");
                    }

                    // hide __ASPECTS__ property!
                    //todo:
                    // obj.__ASPECTS__, obj['__ASPECTS__']
                    if(node.type == JSParser.FOR_IN){
                        if(node.varDecl != null){
                            node.varDecl = node.varDecl.accept(this);
                        }
                        node.object = node.object.accept(this); //expr
                        node.body = new WrapperNode(
                                "{if(" + node.iterator.value + "=='__ASPECTS__')continue;",
                                node.body.accept(this),
                                "}");
                        return node;
                    }

                    //todo: hide __ASPECTS__
                    if(node.type == JSParser.DELETE){
                        //dbg(node);
                        var x = getObjectAndProp(node);
                        o = x[0];
                        v = x[1];
                        if(node[0].type == JSParser.DOT){
                            v = new ChameleonNode(JSParser.STRING, {
                                value: v.value
                            });
                        }

                        node[0] = new ChameleonNode(JSParser.INDEX, {0: o.accept(this), 1: v})
                        return node;
                    }


                    return recursiveVisitor.visit.call(this, node);
                };

                nodeStack.push(node);
                var r = actualVisit.call(this, node);
                nodeStack.pop();

                return r;
            };
        }

        // --- Variable analysis ---

        function VarCollectorVisitor(nodeStack){

            var variables = [];

            //collect parameter names (only the ones from the first enclosing function)
            for(var i = nodeStack.length - 1; i >= 0; --i){
                var node = nodeStack[i];
                if(node.type == JSParser.FUNCTION){
                    for(var j = 0; j < node.params.length; ++j){
                        variables.push(node.params[j]);
                    }

                    break;
                }
            }

            this.vars = function(){
                return variables;
            };

            this.visit = function(node){

                if(node.type == JSParser.VAR){
                    for(var i = 0; i < node.length; ++i){
                        var varName = node[i].value;
                        variables.push(varName);
                    }

                    return node;
                }

                if(node.type == JSParser.FUNCTION){
                    if(node.name){
                        variables.push(node.name);
                    }

                    return node;
                }

                return recursiveVisitor.visit.call(this, node);
            };
        }

        // --- PP ---

        function PPVisitor(){

            var nodeStack = [];

            function inside(type){
                return stackParent(-1, type);
            }

            function stackParent(depth, type){
                if(depth == -1){
                    for(var i = nodeStack.length - 2; i >= 0; --i){
                        if(nodeStack[i].type == type){
                            return true;
                        }
                    }

                    return false;
                }
                else{
                    if(nodeStack.length <= depth){
                        return false;
                    }

                    return nodeStack[nodeStack.length - 1 - depth].type == type;
                }
            }

            this.visit = function(node){

                var actualVisit = function(){
                    var code, i;

                    if(node.type == JSParser.SCRIPT){
                        //dbg(node);
                        code = "";
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this) + "\n";
                        }
                        return code;
                    }

                    // Functions

                    if(node.type == JSParser.FUNCTION){
                        var fName = (node.name) ? node.name : "";
                        var body = node.body.accept(this);
                        body = (body != "") ? "\n" + body : body;

                        return "function " + fName + "(" + node.params + "){" + body + "}";
                    }

                    if(node.type == JSParser.NEW || node.type == JSParser.NEW_WITH_ARGS){
                        var args = (node.type == JSParser.NEW_WITH_ARGS) ? node[1].accept(this) : "";
                        return "new " + node[0].accept(this) + "(" + args + ")";
                    }

                    // Assignments

                    if(node.type == JSParser.ASSIGN){
                        var op = (node.value == "=") ? "=" : node.value + "=";
                        return node[0].accept(this) + " " + op + " " + node[1].accept(this);
                    }

                    if(node.type == JSParser.VAR){
                        code = node.value + " "; //var or const
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this); //identifier
                            if(i < node.length - 1){
                                code += ",";
                            }
                        }

                        if(stackParent(1, JSParser.SCRIPT) || stackParent(1, JSParser.BLOCK)){
                            return code + ";";
                        }

                        return code;
                    }

                    //var declaration
                    if(node.type == JSParser.IDENTIFIER){
                        code = node.value;
                        if(node.initializer){
                            code += " = " + node.initializer.accept(this);
                        }
                        return code;
                    }

                    // Everything else

                    if(node.type == JSParser.SEMICOLON){
                        if(!node.expression){
                            return ";";
                        }

                        return node.expression.accept(this) + ";";
                    }

                    if(node.type == JSParser.OBJECT_INIT){
                        code = "{";
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this);
                            if(i < node.length - 1){
                                code += ", ";
                            }
                        }
                        code += "}";
                        return code;
                    }

                    if(node.type == JSParser.PROPERTY_INIT){
                        return node[0].value + " : " + node[1].accept(this);
                    }

                    if(node.type == JSParser.CALL){
                        return node[0].accept(this) + "(" + node[1].accept(this) + ")";
                    }

                    if(node.type == JSParser.DOT){  //obj.methodName
                        return node[0].accept(this) + "." + node[1].accept(this);
                    }

                    if(node.type == JSParser.GROUP){ // parens
                        return "(" + node[0].accept(this) + ")";
                    }

                    if(node.type == JSParser.LIST){
                        code = "";
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this);
                            if(i < node.length - 1){
                                code += ",";
                            }
                        }
                        return code;
                    }

                    if(node.type == JSParser.WITH){
                        throw "with is not supported";
                    }

                    if(node.type == JSParser.FOR_IN){
                        if(node.varDecl == null){
                            return "for(" + node.iterator.accept(this) + " in " + node.object.accept(this) + ")" +
                                   node.body.accept(this);
                        }
                        else{
                            return "for(" + node.varDecl.accept(this) + " in " + node.object.accept(this) + ")" +
                                   node.body.accept(this);
                        }
                    }

                    if(node.type == JSParser.FOR){
                        var setup = (node.setup) ? node.setup.accept(this) : "";
                        var condition = (node.condition) ? node.condition.accept(this) : "";
                        var update = (node.update) ? node.update.accept(this) : "";

                        return "for(" + setup + ";" + condition + ";" + update + ")" + node.body.accept(this);
                    }

                    if(node.type == JSParser.WHILE){
                        return "while(" + node.condition.accept(this) + ")" + node.body.accept(this);
                    }

                    if(node.type == JSParser.DO){
                        return "do " + node.body.accept(this) + " while(" + node.condition.accept(this) + ")";
                    }

                    if(node.type == JSParser.TRY){
                        code = "try" + node.tryBlock.accept(this);
                        for(i in node.catchClauses){
                            if(i == "top"){ //narcissus adds this method to Node?
                                continue;
                            }
                            code += node.catchClauses[i].accept(this);
                        }
                        if(node.finallyBlock){
                            code += "finally" + node.finallyBlock.accept(this);
                        }
                        return code;
                    }

                    if(node.type == JSParser.CATCH){
                        return "catch(" + node.varName + ")" + node.block.accept(this);
                    }

                    if(node.type == JSParser.IN){
                        return node[0].accept(this) + " in " + node[1].accept(this);
                        /*for(var i = 0; i < node.length; ++i){
                         node[i].accept(this);
                         }
                         return;*/
                    }

                    if(node.type == JSParser.ARRAY_INIT){
                        code = "[";
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this);
                            if(i < node.length - 1){
                                code += ", ";
                            }
                        }
                        code += "]";
                        return code;
                    }

                    if(node.type == JSParser.BLOCK){
                        code = "{\n";
                        for(i = 0; i < node.length; ++i){
                            code += node[i].accept(this) + "\n";
                        }
                        code += "}";
                        return code;
                    }

                    if(node.type == JSParser.TYPEOF){
                        return "typeof(" + node[0].accept(this) + ")";
                    }

                    if(node.type == JSParser.INSTANCEOF){
                        return node[0].accept(this) + " instanceof " + node[1].accept(this);
                    }

                    if(node.type == JSParser.DELETE){
                        return "delete " + node[0].accept(this);
                    }

                    if(node.type == JSParser.COMMA){
                        code = node[0].accept(this);
                        for(i = 1; i < node.length; ++i){
                            code += "," + node[i].accept(this);
                        }
                        return code;
                    }

                    if(node.type == JSParser.EQ || node.type == JSParser.NE || node.type == JSParser.STRICT_EQ || node.type == JSParser.STRICT_NE ||
                       node.type == JSParser.LE || node.type == JSParser.LT || node.type == JSParser.GT || node.type == JSParser.GE ||
                       node.type == JSParser.PLUS || node.type == JSParser.MINUS || node.type == JSParser.MOD ||
                       node.type == JSParser.MUL || node.type == JSParser.DIV ||
                       node.type == JSParser.RSH || node.type == JSParser.LSH || node.type == JSParser.URSH ||
                       node.type == JSParser.AND || node.type == JSParser.OR ||
                       node.type == JSParser.BITWISE_OR || node.type == JSParser.BITWISE_AND || node.type == JSParser.BITWISE_XOR){
                        return node[0].accept(this) + " " + node.value + " " + node[1].accept(this);
                    }

                    if(node.type == JSParser.INCREMENT || node.type == JSParser.DECREMENT || node.type == JSParser.NOT ||
                       node.type == JSParser.UNARY_PLUS || node.type == JSParser.UNARY_MINUS){
                        if(node.postfix){
                            return node[0].accept(this) + node.value;
                        }
                        else{
                            return node.value + node[0].accept(this);
                        }
                    }

                    if(node.type == JSParser.RETURN){
                        value = (node.value == "return") ? "" : node.value.accept(this);
                        return "return " + value + ";";
                    }

                    if(node.type == JSParser.IF){
                        code = "if(" + node.condition.accept(this) + ")" + node.thenPart.accept(this);

                        if(node.elsePart){
                            code += " else " + node.elsePart.accept(this);
                        }

                        return code;
                    }

                    if(node.type == JSParser.HOOK){  // a? b : c;
                        //parentesis to avoid some corner cases
                        return "((" + node[0].accept(this) + ")?(" + node[1].accept(this) + "):(" + node[2].accept(this) + "))";
                    }

                    if(node.type == JSParser.THROW){
                        return "throw " + node.exception.accept(this);
                    }

                    if(node.type == JSParser.SWITCH){
                        code = "switch(" + node.discriminant.accept(this) + "){\n";
                        for(i in node.cases){
                            if(i == "top"){ //narcissus adds this method to Node
                                continue;
                            }
                            code += node.cases[i].accept(this) + "\n";
                        }
                        code += "}";
                        return code;
                    }

                    if(node.type == JSParser.LABEL){
                        return node.label + ": " + node.statement.accept(this);
                    }

                    if(node.type == JSParser.CASE){
                        return "case " + node.caseLabel.accept(this) + ": " + node.statements.accept(this);
                    }

                    if(node.type == JSParser.DEFAULT){
                        return "default: " + node.statements.accept(this);
                    }

                    if(node.type == JSParser.INDEX){ //array-style access
                        return node[0].accept(this) + "[" + node[1].accept(this) + "]";
                    }

                    if(node.type == JSParser.THIS ||
                       node.type == JSParser.NUMBER || node.type == JSParser.NULL || node.type == JSParser.REGEXP ||
                       node.type == JSParser.BREAK || node.type == JSParser.CONTINUE ||
                       node.type == JSParser.TRUE || node.type == JSParser.FALSE){
                        return node.value;
                    }

                    if(node.type == JSParser.STRING){
                        var c = node.value.charAt(0);
                        if(c == "\"" || c == "'"){
                            return node.value;
                        }
                        return "\"" + node.value + "\"";
                    }

                    //TRANSFORMATION

                    if(node.type == WRAPPER_NODE){
                        return node.preffix + node.wrapped.accept(this) + node.suffix;
                    }

                    dbg("pp: " + node);
                };

                nodeStack.push(node);
                var r = actualVisit.call(this);
                nodeStack.pop();

                return r;
            };
        }

        var WRAPPER_NODE = "WN";

        function WrapperNode(p, n, s){
            this.type = WRAPPER_NODE;
            this.preffix = p;
            this.wrapped = n;
            this.suffix = s;
            this.accept = function(v){
                return v.visit(this);
            };
            this.toString = function(){
                return "WN: " + p + " <node> " + s;
            };
        }

        function ChameleonNode(type, p){
            this.type = type;
            this.__proto__ = p;
            this.accept = function(v){
                return v.visit(this);
            };
            this.toString = function(){
                return "Chameleon: " + this.type;
            };
        }

        function getConstantValueNode(value){
            if(typeof(value) != "string"){
                throw "newValueNode: " + typeof(value);
            }

            return new ChameleonNode(JSParser.NULL, {value: value});
        }

        // --- Public functions ---

        this.rewrite = function(source, jpModel){
            if(!jpModel){
                jpModel = {
                    jpNew: true,
                    jpInit: true,
                    jpCall: true,
                    jpExec: true,
                    jpPropRead: false,
                    jpPropWrite: false,
                    jpVarRead: false,
                    jpVarWrite: false
                };
            }
            var x = JSParser.parse(source, "", 1);
            x = x.accept(new HookHackVisitor());
            x = x.accept(new CodeGenerationVisitor(jpModel));
            return x.accept(new PPVisitor());
        };

        this.prettyPrint = function(source){
            var x = JSParser.parse(source, "", 1);
            x = x.accept(new HookHackVisitor());
            return x.accept(new PPVisitor());
        };

        // --- Hack ---

        //hack to the parser, this should be in parse.js

        function HookHackVisitor(){
            this.visit = function(node){
                //---------------------------------------
                //todo this only works for the first level
                if(node.type == JSParser.HOOK){  // a? b : c;
                    //dbg("-->" + node.accept(new PPVisitor()));

                    node[0] = node[0].accept(this);
                    node[1] = node[1].accept(this);
                    node[2] = node[2].accept(this);

                    if(node[2].type == JSParser.HOOK){
                        //dbg("--------------------------")
                        //dbg(node.accept(new PPVisitor()));
                        //dbg("--------------------------")
                        var aux = node[1];
                        node[1] = node[2];
                        node[2] = node[1][2];
                        node[1][2] = node[1][1];
                        node[1][1] = node[1][0];
                        node[1][0] = aux;
                        //dbg(node.accept(new PPVisitor()));
                        //dbg("--------------------------")
                    }

                    return node;
                }

                return recursiveVisitor.visit.call(this, node);
            };
        }
    }

    //singleton
    return new Constructor();
}();
