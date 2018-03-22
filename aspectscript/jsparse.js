/* vim: set sw=4 ts=8 et tw=78: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Narcissus - JS implemented in JS.
 *
 * Lexical scanner and parser.
 *
 * Optimized version (AspectScript project. http://www.pleiad.cl/aspectscript)
 */

var JSParser = function(){

    function Constructor(){

        var JSParser = this;

        // BEGIN OLD jsdefs.js ---------------------------------

        const GLOBAL = {};

        var tokens = [
            // End of source.
            "END",

            // Operators and punctuators.  Some pair-wise order matters, e.g. (+, -)
            // and (UNARY_PLUS, UNARY_MINUS).
            "\n", ";",
            ",",
            "=",
            "?", ":", "CONDITIONAL",
            "||",
            "&&",
            "|",
            "^",
            "&",
            "==", "!=", "===", "!==",
            "<", "<=", ">=", ">",
            "<<", ">>", ">>>",
            "+", "-",
            "*", "/", "%",
            "!", "~", "UNARY_PLUS", "UNARY_MINUS",
            "++", "--",
            ".",
            "[", "]",
            "{", "}",
            "(", ")",

            // Nonterminal tree node type codes.
            "SCRIPT", "BLOCK", "LABEL", "FOR_IN", "CALL", "NEW_WITH_ARGS", "INDEX",
            "ARRAY_INIT", "OBJECT_INIT", "PROPERTY_INIT", "GETTER", "SETTER",
            "GROUP", "LIST",

            // Terminals.
            "IDENTIFIER", "NUMBER", "STRING", "REGEXP",

            // Keywords.
            "break",
            "case", "catch", "const", "continue",
            "debugger", "default", "delete", "do",
            "else", "enum",
            "false", "finally", "for", "function",
            "if", "in", "instanceof",
            "new", "null",
            "return",
            "switch",
            "this", "throw", "true", "try", "typeof",
            "var", "void",
            "while", "with"
        ];

        // Operator and punctuator mapping from token to tree node type name.
        // NB: superstring tokens (e.g., ++) must come before their substring token
        // counterparts (+ in the example), so that the opRegExp regular expression
        // synthesized from this list makes the longest possible match.
        var opTypeNames = {
            '\n':   "NEWLINE",
            ';':    "SEMICOLON",
            ',':    "COMMA",
            '?':    "HOOK",
            ':':    "COLON",
            '||':   "OR",
            '&&':   "AND",
            '|':    "BITWISE_OR",
            '^':    "BITWISE_XOR",
            '&':    "BITWISE_AND",
            '===':  "STRICT_EQ",
            '==':   "EQ",
            '=':    "ASSIGN",
            '!==':  "STRICT_NE",
            '!=':   "NE",
            '<<':   "LSH",
            '<=':   "LE",
            '<':    "LT",
            '>>>':  "URSH",
            '>>':   "RSH",
            '>=':   "GE",
            '>':    "GT",
            '++':   "INCREMENT",
            '--':   "DECREMENT",
            '+':    "PLUS",
            '-':    "MINUS",
            '*':    "MUL",
            '/':    "DIV",
            '%':    "MOD",
            '!':    "NOT",
            '~':    "BITWISE_NOT",
            '.':    "DOT",
            '[':    "LEFT_BRACKET",
            ']':    "RIGHT_BRACKET",
            '{':    "LEFT_CURLY",
            '}':    "RIGHT_CURLY",
            '(':    "LEFT_PAREN",
            ')':    "RIGHT_PAREN"
        };

        // Hash of keyword identifier to tokens index.  NB: we must null __proto__ to
        // avoid toString, etc. namespace pollution.
        var keywords = {__proto__: null};

        // Define const END, etc., based on the token names.  Also map name to index.
        var consts = "const ";
        for(var i = 0, j = tokens.length; i < j; i++){
            var t = tokens[i];
            var name;
            if(/^[a-z]/.test(t)){
                name = t.toUpperCase();
                keywords[t] = i;
            }
            else{
                name = (/^\W/.test(t) ? opTypeNames[t] : t);
            }
            consts += (name + "=" + i + (i < j - 1 ? "," : "")); //for local access
            GLOBAL[name] = i; //local access
            JSParser[name] = i; //global access
            tokens[t] = i;
        }

        try {
            eval(consts + ";");
        }
        catch(e) {
            print ("consts:" + consts + " YYYYYY \n");
            //throw "XXXXXXX";
        }

        // Map assignment operators to their indexes in the tokens array.
        var assignOps = ['|', '^', '&', '<<', '>>', '>>>', '+', '-', '*', '/', '%'];

        for(i = 0,j = assignOps.length; i < j; i++){
            t = assignOps[i];
            assignOps[t] = tokens[t];
        }

        // END OLD jsdefs.js -----------------------------------

        function StringBuffer(s){

            var chars = [];
            for(var i = 0; i < s.length; ++i){
                chars[i] = (s.charAt(i));
            }

            var offset = 0;

            this.substring = function(start, end){
                if(typeof(end) == "undefined"){
                    end = chars.length - offset;
                }

                return s.substring(offset + start, offset + end);
            };

            this.charAt = function(idx){
                return chars[offset + idx];
            };

            this.match = function(re){
                return this.substring(0).match(re);
            };

            this.setOffset = function(o){
                offset = o;
            };

            this.__defineGetter__("length", function(){
                return chars.length - offset;
            });

            this.empty = function(){
                return offset == chars.length;
            };

            this.toString = function(){
                return this.substring(0);
            };
        }

        function Tokenizer(s, f, l){
            this.source = new StringBuffer(s);
            this.cursor = 0;
            this.tokens = [];
            this.tokenIndex = 0;
            this.lookahead = 0;
            this.scanNewlines = false;
            this.scanOperand = true;
            this.filename = f || "";
            this.lineno = l || 1;
        }

        Tokenizer.prototype = {
            get input(){
                this.source.setOffset(this.cursor);
                return this.source;
            },

            get done(){
                return this.peek() == END;
            },

            get token(){
                return this.tokens[this.tokenIndex];
            },

            match: function (tt){
                return this.get() == tt || this.unget();
            },

            mustMatch: function (tt){
                if(!this.match(tt))
                {
                    throw this.newSyntaxError("Missing " + tokens[tt].toLowerCase());
                }
                return this.token;
            },

            peek: function (){
                var tt, next;
                if(this.lookahead){
                    next = this.tokens[(this.tokenIndex + this.lookahead) & 3];
                    if(this.scanNewlines && next.lineno != this.lineno)
                    {
                        tt = NEWLINE;
                    }
                    else
                    {
                        tt = next.type;
                    }
                }
                else{
                    tt = this.get();
                    this.unget();
                }
                return tt;
            },

            peekOnSameLine: function (){
                this.scanNewlines = true;
                var tt = this.peek();
                this.scanNewlines = false;
                return tt;
            },

            get: function (){
                var token;
                while(this.lookahead){
                    --this.lookahead;
                    this.tokenIndex = (this.tokenIndex + 1) & 3;
                    token = this.tokens[this.tokenIndex];
                    if(token.type != NEWLINE || this.scanNewlines)
                    {
                        return token.type;
                    }
                }

                while(true){
                    var input = this.input;
                    var match = this.tokenizeSpaces(input);
                    if(match){
                        var spaces = match[0];
                        this.cursor += spaces.length;
                        this.lineno += this.countNewLines(spaces);
                        input = this.input;
                    }

                    if(!(match = this.tokenizeComment(input)))
                    {
                        break;
                    }

                    var comment = match[0];
                    this.cursor += comment.length;
                    this.lineno += this.countNewLines(comment);
                }

                this.tokenIndex = (this.tokenIndex + 1) & 3;
                token = this.tokens[this.tokenIndex];
                if(!token)
                {
                    this.tokens[this.tokenIndex] = token = {};
                }

                if(input.empty())
                {
                    return token.type = END;
                }

                function __(m){
                    //console.log(m);
                }

                //keywords and identifiers
                if((match = this.tokenizeWord(input))){       // FIXME no ES3 unicode
                    var id = match[0];
                    __("w --> [" + match[0] + "]");
                    token.type = keywords[id] || IDENTIFIER;
                    token.value = id;
                }
                //strings
                else{
                    if((match = this.tokenizeString(input))){
                        __("s --> [" + match[0] + "]");
                        token.type = STRING;
                        token.value = match[0];
                    }
                    //floats
                    else{
                        if((match = this.tokenizeFloat(input))){  //this should be before tokenizeInt
                            __("f --> [" + match[0] + "]");
                            token.type = NUMBER;
                            token.value = parseFloat(match[0]);
                        }
                        //integers
                        else{
                            if((match = this.tokenizeInt(input))){
                                __("i --> [" + match[0] + "]");
                                token.type = NUMBER;
                                token.value = parseInt(match[0]);
                            }
                            //regular expression
                            else{
                                if(this.scanOperand && (match = this.tokenizeRE(input))){
                                    __("re --> [" + match[1] + "][" + match[2] + "]");
                                    token.type = REGEXP;
                                    token.value = match[1] + match[2];
                                }
                                //operators
                                else{
                                    if((match = this.tokenizeOp(input))){
                                        var op = match[0];
                                        if(assignOps[op] && input.charAt(op.length) == '='){
                                            token.type = ASSIGN;
                                            token.assignOp = GLOBAL[opTypeNames[op]];
                                            match[0] += '=';
                                        }
                                        else{
                                            token.type = GLOBAL[opTypeNames[op]];
                                            if(this.scanOperand &&
                                               (token.type == PLUS || token.type == MINUS)){
                                                token.type += UNARY_PLUS - PLUS;
                                            }
                                            token.assignOp = null;
                                        }
                                        __("o --> [" + match[0] + "]");
                                        token.value = op; //fix? why not match[0]
                                    }
                                    //spaces and new lines
                                    else{
                                        if(this.scanNewlines && (match = this.tokenizeNewLine(input))){
                                            token.type = NEWLINE;
                                        }
                                        //error
                                        else{
                                            throw this.newSyntaxError("Illegal token");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                token.start = this.cursor;
                this.cursor += match[0].length;
                token.end = this.cursor;
                token.lineno = this.lineno;
                return token.type;
            },

            countNewLines: function(input){
                //return input.match(/\n/g);
                var n = 0;
                for(var i = 0; i < input.length; ++i){
                    if(input.charAt(i) == '\n'){
                        n++;
                    }
                }
                return n;
            },

            tokenizeComment: function(input){
                //return /^\/(?:\*(?:.|\n)*?\*\/|\/.*)/(input);
                var c = input.charAt(0);
                if(c != '/'){
                    return false;
                }

                c = input.charAt(1);
                if(c != '/' && c != '*'){
                    return false;
                }

                // line comment
                var i;
                if(c == '/'){
                    for(i = 2; i < input.length; ++i){
                        c = input.charAt(i);
                        if(c == '\n'){
                            return {0: input.substring(0, i + 1)};  //end of line
                        }
                    }

                    return {0: input};  //end of file
                }
                //block comment
                else{
                    var previousWasStar = false;
                    for(i = 2; i < input.length; ++i){
                        c = input.charAt(i);

                        if(c == '*'){
                            previousWasStar = true;
                            continue;
                        }

                        if(c == '/' && previousWasStar){
                            return {0: input.substring(0, i + 1)};
                        }

                        previousWasStar = false;
                    }

                    return false;
                }
            },

            tokenizeSpaces: function(input){
                //return (this.scanNewlines ? /^[ \t]+/ : /^\s+/)(input);
                for(var i = 0; i < input.length; ++i){
                    var c = input.charAt(i);

                    // [ \t]+
                    if(this.scanNewlines){
                        if(c == ' ' || c == '\t'){
                            continue;
                        }
                    }
                    // \s+ == [ \t\r\n\v\f]+
                    else{
                        if(c == ' ' || c == '\t' || c == '\r' || c == '\n' || c == '\v' || c == '\f'){
                            continue;
                        }
                    }

                    if(i == 0){
                        return false;
                    }

                    return {0: input.substring(0, i)};
                }

                return {0: input};
            },

            tokenizeRE: function(input){
                // return /^\/((?:\\.|\[(?:\\.|[^\]])*\]|[^\/])+)\/([gimy]*)(input)/
                var c = input.charAt(0);
                if(c != '/'){
                    return false;
                }

                var previousWasBackslash = false;
                for(var i = 1; i < input.length; ++i){
                    c = input.charAt(i);

                    if(c == '\\'){
                        previousWasBackslash = !previousWasBackslash; //two \\
                        continue;
                    }

                    if(c == '/'){
                        //two consecutive /
                        if(i == 1){
                            return false;
                        }
                        if(previousWasBackslash){
                            previousWasBackslash = false;
                            continue;
                        }
                        //look for modifiers after closing /
                        for(var j = i + 1; j < input.length; ++j){
                            c = input.charAt(j);

                            if("gimy".indexOf(c) >= 0){
                                continue;
                            }

                            return {
                                0: input.substring(0, j),
                                1: input.substring(0, i + 1),
                                2: input.substring(i + 1, j)
                            };
                        }
                    }

                    previousWasBackslash = false;
                }

                return false;
            },

            tokenizeOp: function(input){
                //return opRegExp(input);
                main: for(var op in opTypeNames){
                    if(op == '\n'){
                        continue;
                    }

                    for(var i = 0; i < op.length; ++i){
                        if(input.charAt(i) != op.charAt(i)){
                            continue main;
                        }
                    }

                    return {0: op};
                }

                return false;
            },

            tokenizeNewLine: function(input){
                //return /^\n/(input);
                return input.charAt(0) == '\n';
            },

            tokenizeFloat: function(input){
                // return /^\d+\.\d*(?:[eE][-+]?\d+)?|^\d+(?:\.\d*)?[eE][-+]?\d+|^\.\d+(?:[eE][-+]?\d+)?(input)/

                function isNumber(c){
                    return ('0' <= c && c <= '9');
                }

                var c = input.charAt(0);
                if(c != '.' && !isNumber(c)){
                    return false;
                }

                var pointAlreadyFound = (c == '.');

                for(var i = 1; i < input.length; ++i){
                    c = input.charAt(i);

                    if(isNumber(c)){
                        continue;
                    }

                    if(c == '.'){
                        if(pointAlreadyFound){
                            return false;
                        }

                        pointAlreadyFound = true;
                        continue;
                    }

                    //optional exp
                    if(c == 'e' || c == 'E'){
                        ++i;
                        c = input.charAt(i);
                        if(c == '+' || c == '-'){  //optional sign
                            ++i;
                        }

                        for(var j = i; j < input.length; ++j){
                            c = input.charAt(j);

                            if(isNumber(c)){
                                continue;
                            }

                            if(j == i){ //no number after "E"
                                return false;
                            }

                            return {0: input.substring(0, j)};
                        }

                        return {0: input};
                    }

                    if(i == 1){
                        return false;
                    }

                    return {0: input.substring(0, i)};
                }

                return {0: input};
            },

            tokenizeInt: function(input){
                // return /^0[xX][\da-fA-F]+|^0[0-7]*|^\d+/(input)
                //hex
                var c = input.charAt(0);
                var d = (input.length > 1) ? input.charAt(1).toLowerCase() : null;
                var i;
                if(c == '0' && d == 'x' && input.length > 2){ //0, x and something else
                    for(i = 3; i < input.length; ++i){
                        c = input.charAt(i);
                        if(('0' <= c && c <= '9') || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F')){
                            continue;
                        }

                        if(i == 3){
                            return {0: "0"}; //at least "0" matched
                        }

                        return {0: input.substring(0, i)};
                    }
                }
                //oct and int
                else{
                    for(i = 0; i < input.length; ++i){
                        c = input.charAt(i);
                        if('0' <= c && c <= '9'){
                            continue;
                        }

                        if(i == 0){
                            return false;
                        }

                        return {0: input.substring(0, i)};
                    }

                    return {0: input};
                }

                return false;
            },

            tokenizeString: function(input){
                // return /^"(?:\\.|[^"])*"|^'(?:\\.|[^'])*(input)'/
                var firstChar = input.charAt(0);
                if(firstChar == '"' || firstChar == '\''){
                    var previousWasBackslash = false;
                    for(var i = 1; i < input.length; ++i){
                        var c = input.charAt(i);
                        if(c == '\\'){
                            previousWasBackslash = !previousWasBackslash; //two \\
                        }
                        else{
                            if(c == firstChar){
                                if(!previousWasBackslash){
                                    return {0: input.substring(0, i + 1)};
                                }
                                previousWasBackslash = false;
                            }
                            else{
                                previousWasBackslash = false;
                            }
                        }
                    }
                }

                return false;
            },

            tokenizeWord: function(input){ // /^[$_\w]+/
                //the old RE also matches numbers, that's why it was after the RE for numbers

                function isValidWordStart(c){
                    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c == '$' || c == '_';
                }

                if(!isValidWordStart(input.charAt(0))){
                    return false;
                }

                for(var i = 1; i < input.length; ++i){
                    var c = input.charAt(i);
                    if(isValidWordStart(c) || ('0' <= c && c <= '9')){
                        continue;
                    }

                    return {0: input.substring(0, i)};
                }

                return {0: input};
            },

            unget: function (){
                if(++this.lookahead == 4){
                    throw "PANIC: too much lookahead!";
                }
                this.tokenIndex = (this.tokenIndex - 1) & 3;
            },

            newSyntaxError: function (m){
                var e = new SyntaxError(m, this.filename, this.lineno);
                e.source = this.source;
                e.cursor = this.cursor;
                return e;
            }
        };

        function CompilerContext(inFunction){
            this.inFunction = inFunction;
            this.stmtStack = [];
            this.funDecls = [];
            this.varDecls = [];
        }

        var CCp = CompilerContext.prototype;
        CCp.bracketLevel = CCp.curlyLevel = CCp.parenLevel = CCp.hookLevel = 0;
        CCp.ecmaStrictMode = CCp.inForLoopInit = false;

        function Script(t, x){
            var n = Statements(t, x);
            n.type = SCRIPT;
            n.funDecls = x.funDecls;
            n.varDecls = x.varDecls;
            return n;
        }

        Array.prototype.top = function (){
            return this.length && this[this.length - 1];
        };

        var Node = this.Node = function(t, type){
            var token = t.token;
            if(token){
                this.type = type || token.type;
                this.value = token.value;
                this.lineno = token.lineno;
                this.start = token.start;
                this.end = token.end;
            }
            else{
                this.type = type;
                this.lineno = t.lineno;
            }
            this.tokenizer = t;

            for(var i = 2; i < arguments.length; i++)
            {
                this.push(arguments[i]);
            }
        };

        var Np = Node.prototype = new Array;
        Np.constructor = Node;
        Np.toSource = Object.prototype.toSource;

        // Always use push to add operands to an expression, to update start and end.
        Np.push = function (kid){
            if(kid.start < this.start)
            {
                this.start = kid.start;
            }
            if(this.end < kid.end)
            {
                this.end = kid.end;
            }
            return Array.prototype.push.call(this, kid);
        };

        Node.indentLevel = 0;

        function tokenstr(tt){
            var t = tokens[tt];
            return /^\W/.test(t) ? opTypeNames[t] : t.toUpperCase();
        }

        Np.toString = function (){
            var a = [];
            for(var i in this){
                if(this.hasOwnProperty(i) && i != 'type' && i != 'target')
                {
                    a.push({id: i, value: this[i]});
                }
            }
            a.sort(function (a, b){
                return (a.id < b.id) ? -1 : 1;
            });
            const INDENTATION = "    ";
            var n = ++Node.indentLevel;
            var s = "{\n" + INDENTATION.repeat(n) + "type: " + tokenstr(this.type);
            for(i = 0; i < a.length; i++)
            {
                s += ",\n" + INDENTATION.repeat(n) + a[i].id + ": " + a[i].value;
            }
            n = --Node.indentLevel;
            s += "\n" + INDENTATION.repeat(n) + "}";
            return s;
        };

        Np.getSource = function (){
            return this.tokenizer.source.slice(this.start, this.end);
        };

        Np.__defineGetter__('filename',
                            function (){
                                return this.tokenizer.filename;
                            });

        String.prototype.repeat = function (n){
            var s = "", t = this + s;
            while(--n >= 0)
            {
                s += t;
            }
            return s;
        };

        // Statement stack and nested statement handler.
        function nest(t, x, node, func, end){
            x.stmtStack.push(node);
            var n = func(t, x);
            x.stmtStack.pop();
            end && t.mustMatch(end);
            return n;
        }

        function Statements(t, x){
            var n = new Node(t, BLOCK);
            x.stmtStack.push(n);
            while(!t.done && t.peek() != RIGHT_CURLY)
            {
                n.push(Statement(t, x));
            }
            x.stmtStack.pop();
            return n;
        }

        function __Block(t, x){
            t.mustMatch(LEFT_CURLY);
            var n = Statements(t, x);
            t.mustMatch(RIGHT_CURLY);
            return n;
        }

        const DECLARED_FORM = 0, EXPRESSED_FORM = 1, STATEMENT_FORM = 2;

        function Statement(t, x){
            var i, label, n, n2, ss, tt = t.get();

            // Cases for statements ending in a right curly return early, avoiding the
            // common semicolon insertion magic after this switch.
            switch(tt){
                case FUNCTION:
                    return FunctionDefinition(t, x, true,
                                              (x.stmtStack.length > 1)
                                                      ? STATEMENT_FORM
                                                      : DECLARED_FORM);

                case LEFT_CURLY:
                    n = Statements(t, x);
                    t.mustMatch(RIGHT_CURLY);
                    return n;

                case IF:
                    n = new Node(t);
                    n.condition = ParenExpression(t, x);
                    x.stmtStack.push(n);
                    n.thenPart = Statement(t, x);
                    n.elsePart = t.match(ELSE) ? Statement(t, x) : null;
                    x.stmtStack.pop();
                    return n;

                case SWITCH:
                    n = new Node(t);
                    t.mustMatch(LEFT_PAREN);
                    n.discriminant = Expression(t, x);
                    t.mustMatch(RIGHT_PAREN);
                    n.cases = [];
                    n.defaultIndex = -1;
                    x.stmtStack.push(n);
                    t.mustMatch(LEFT_CURLY);
                    while((tt = t.get()) != RIGHT_CURLY){
                        switch(tt){
                            case DEFAULT:
                                if(n.defaultIndex >= 0)
                                {
                                    throw t.newSyntaxError("More than one switch default");
                                }
                            // FALL THROUGH
                            case CASE:
                                n2 = new Node(t);
                                if(tt == DEFAULT)
                                {
                                    n.defaultIndex = n.cases.length;
                                }
                                else
                                {
                                    n2.caseLabel = Expression(t, x, COLON);
                                }
                                break;
                            default:
                                throw t.newSyntaxError("Invalid switch case");
                        }
                        t.mustMatch(COLON);
                        n2.statements = new Node(t, BLOCK);
                        while((tt = t.peek()) != CASE && tt != DEFAULT && tt != RIGHT_CURLY)
                        {
                            n2.statements.push(Statement(t, x));
                        }
                        n.cases.push(n2);
                    }
                    x.stmtStack.pop();
                    return n;

                case FOR:
                    n = new Node(t);
                    n.isLoop = true;
                    t.mustMatch(LEFT_PAREN);
                    if((tt = t.peek()) != SEMICOLON){
                        x.inForLoopInit = true;
                        if(tt == VAR || tt == CONST){
                            t.get();
                            n2 = Variables(t, x);
                        }
                        else{
                            n2 = Expression(t, x);
                        }
                        x.inForLoopInit = false;
                    }
                    if(n2 && t.match(IN)){
                        n.type = FOR_IN;
                        if(n2.type == VAR){
                            if(n2.length != 1){
                                throw new SyntaxError("Invalid for..in left-hand side",
                                                      t.filename, n2.lineno);
                            }

                            // NB: n2[0].type == IDENTIFIER and n2[0].value == n2[0].name.
                            n.iterator = n2[0];
                            n.varDecl = n2;
                        }
                        else{
                            n.iterator = n2;
                            n.varDecl = null;
                        }
                        n.object = Expression(t, x);
                    }
                    else{
                        n.setup = n2 || null;
                        t.mustMatch(SEMICOLON);
                        n.condition = (t.peek() == SEMICOLON) ? null : Expression(t, x);
                        t.mustMatch(SEMICOLON);
                        n.update = (t.peek() == RIGHT_PAREN) ? null : Expression(t, x);
                    }
                    t.mustMatch(RIGHT_PAREN);
                    n.body = nest(t, x, n, Statement);
                    return n;

                case WHILE:
                    n = new Node(t);
                    n.isLoop = true;
                    n.condition = ParenExpression(t, x);
                    n.body = nest(t, x, n, Statement);
                    return n;

                case DO:
                    n = new Node(t);
                    n.isLoop = true;
                    n.body = nest(t, x, n, Statement, WHILE);
                    n.condition = ParenExpression(t, x);
                    if(!x.ecmaStrictMode){
                        // <script language="JavaScript"> (without version hints) may need
                        // automatic semicolon insertion without a newline after do-while.
                        // See http://bugzilla.mozilla.org/show_bug.cgi?id=238945.
                        t.match(SEMICOLON);
                        return n;
                    }
                    break;

                case BREAK:
                case CONTINUE:
                    n = new Node(t);
                    if(t.peekOnSameLine() == IDENTIFIER){
                        t.get();
                        n.label = t.token.value;
                    }
                    ss = x.stmtStack;
                    i = ss.length;
                    label = n.label;
                    if(label){
                        do {
                            if(--i < 0)
                            {
                                throw t.newSyntaxError("Label not found");
                            }
                        } while(ss[i].label != label);
                    }
                    else{
                        do {
                            if(--i < 0){
                                throw t.newSyntaxError("Invalid " + ((tt == BREAK)
                                        ? "break"
                                        : "continue"));
                            }
                        } while(!ss[i].isLoop && (tt != BREAK || ss[i].type != SWITCH));
                    }
                    n.target = ss[i];
                    break;

                case TRY:
                    n = new Node(t);
                    n.tryBlock = __Block(t, x);
                    n.catchClauses = [];
                    while(t.match(CATCH)){
                        n2 = new Node(t);
                        t.mustMatch(LEFT_PAREN);
                        n2.varName = t.mustMatch(IDENTIFIER).value;
                        if(t.match(IF)){
                            if(x.ecmaStrictMode)
                            {
                                throw t.newSyntaxError("Illegal catch guard");
                            }
                            if(n.catchClauses.length && !n.catchClauses.top().guard)
                            {
                                throw t.newSyntaxError("Guarded catch after unguarded");
                            }
                            n2.guard = Expression(t, x);
                        }
                        else{
                            n2.guard = null;
                        }
                        t.mustMatch(RIGHT_PAREN);
                        n2.block = __Block(t, x);
                        n.catchClauses.push(n2);
                    }
                    if(t.match(FINALLY))
                    {
                        n.finallyBlock = __Block(t, x);
                    }
                    if(!n.catchClauses.length && !n.finallyBlock)
                    {
                        throw t.newSyntaxError("Invalid try statement");
                    }
                    return n;

                case CATCH:
                case FINALLY:
                    throw t.newSyntaxError(tokens[tt] + " without preceding try");

                case THROW:
                    n = new Node(t);
                    n.exception = Expression(t, x);
                    break;

                case RETURN:
                    if(!x.inFunction)
                    {
                        throw t.newSyntaxError("Invalid return");
                    }
                    n = new Node(t);
                    tt = t.peekOnSameLine();
                    if(tt != END && tt != NEWLINE && tt != SEMICOLON && tt != RIGHT_CURLY)
                    {
                        n.value = Expression(t, x);
                    }
                    break;

                case WITH:
                    n = new Node(t);
                    n.object = ParenExpression(t, x);
                    n.body = nest(t, x, n, Statement);
                    return n;

                case VAR:
                case CONST:
                    n = Variables(t, x);
                    break;

                case DEBUGGER:
                    n = new Node(t);
                    break;

                case NEWLINE:
                case SEMICOLON:
                    n = new Node(t, SEMICOLON);
                    n.expression = null;
                    return n;

                default:
                    if(tt == IDENTIFIER){
                        t.scanOperand = false;
                        tt = t.peek();
                        t.scanOperand = true;
                        if(tt == COLON){
                            label = t.token.value;
                            ss = x.stmtStack;
                            for(i = ss.length - 1; i >= 0; --i){
                                if(ss[i].label == label)
                                {
                                    throw t.newSyntaxError("Duplicate label");
                                }
                            }
                            t.get();
                            n = new Node(t, LABEL);
                            n.label = label;
                            n.statement = nest(t, x, n, Statement);
                            return n;
                        }
                    }

                    n = new Node(t, SEMICOLON);
                    t.unget();
                    n.expression = Expression(t, x);
                    n.end = n.expression.end;
                    break;
            }

            if(t.lineno == t.token.lineno){
                tt = t.peekOnSameLine();
                if(tt != END && tt != NEWLINE && tt != SEMICOLON && tt != RIGHT_CURLY)
                {
                    throw t.newSyntaxError("Missing ; before statement");
                }
            }
            t.match(SEMICOLON);
            return n;
        }

        function FunctionDefinition(t, x, requireName, functionForm){
            var f = new Node(t);
            if(f.type != FUNCTION)
            {
                f.type = (f.value == "get") ? GETTER : SETTER;
            }
            if(t.match(IDENTIFIER))
            {
                f.name = t.token.value;
            }
            else{
                if(requireName)
                {
                    throw t.newSyntaxError("Missing function identifier");
                }
            }

            t.mustMatch(LEFT_PAREN);
            f.params = [];
            var tt;
            while((tt = t.get()) != RIGHT_PAREN){
                if(tt != IDENTIFIER)
                {
                    throw t.newSyntaxError("Missing formal parameter");
                }
                f.params.push(t.token.value);
                if(t.peek() != RIGHT_PAREN)
                {
                    t.mustMatch(COMMA);
                }
            }

            t.mustMatch(LEFT_CURLY);
            var x2 = new CompilerContext(true);
            f.body = Script(t, x2);
            t.mustMatch(RIGHT_CURLY);
            f.end = t.token.end;

            f.functionForm = functionForm;
            if(functionForm == DECLARED_FORM)
            {
                x.funDecls.push(f);
            }
            return f;
        }

        function Variables(t, x){
            var n = new Node(t);
            do {
                t.mustMatch(IDENTIFIER);
                var n2 = new Node(t);
                n2.name = n2.value;
                if(t.match(ASSIGN)){
                    if(t.token.assignOp)
                    {
                        throw t.newSyntaxError("Invalid variable initialization");
                    }
                    n2.initializer = Expression(t, x, COMMA);
                }
                n2.readOnly = (n.type == CONST);
                n.push(n2);
                x.varDecls.push(n2);
            } while(t.match(COMMA));
            return n;
        }

        function ParenExpression(t, x){
            t.mustMatch(LEFT_PAREN);
            var n = Expression(t, x);
            t.mustMatch(RIGHT_PAREN);
            return n;
        }

        var opPrecedence = {
            SEMICOLON: 0,
            COMMA: 1,
            ASSIGN: 2, HOOK: 2, COLON: 2,
            // The above all have to have the same precedence, see bug 330975.
            OR: 4,
            AND: 5,
            BITWISE_OR: 6,
            BITWISE_XOR: 7,
            BITWISE_AND: 8,
            EQ: 9, NE: 9, STRICT_EQ: 9, STRICT_NE: 9,
            LT: 10, LE: 10, GE: 10, GT: 10, IN: 10, INSTANCEOF: 10,
            LSH: 11, RSH: 11, URSH: 11,
            PLUS: 12, MINUS: 12,
            MUL: 13, DIV: 13, MOD: 13,
            DELETE: 14, VOID: 14, TYPEOF: 14, // PRE_INCREMENT: 14, PRE_DECREMENT: 14,
            NOT: 14, BITWISE_NOT: 14, UNARY_PLUS: 14, UNARY_MINUS: 14,
            INCREMENT: 15, DECREMENT: 15,     // postfix
            NEW: 16,
            DOT: 17
        };

        // Map operator type code to precedence.
        for(i in opPrecedence)
        {
            opPrecedence[GLOBAL[i]] = opPrecedence[i];
        }

        var opArity = {
            COMMA: -2,
            ASSIGN: 2,
            HOOK: 3,
            OR: 2,
            AND: 2,
            BITWISE_OR: 2,
            BITWISE_XOR: 2,
            BITWISE_AND: 2,
            EQ: 2, NE: 2, STRICT_EQ: 2, STRICT_NE: 2,
            LT: 2, LE: 2, GE: 2, GT: 2, IN: 2, INSTANCEOF: 2,
            LSH: 2, RSH: 2, URSH: 2,
            PLUS: 2, MINUS: 2,
            MUL: 2, DIV: 2, MOD: 2,
            DELETE: 1, VOID: 1, TYPEOF: 1,  // PRE_INCREMENT: 1, PRE_DECREMENT: 1,
            NOT: 1, BITWISE_NOT: 1, UNARY_PLUS: 1, UNARY_MINUS: 1,
            INCREMENT: 1, DECREMENT: 1,     // postfix
            NEW: 1, NEW_WITH_ARGS: 2, DOT: 2, INDEX: 2, CALL: 2,
            ARRAY_INIT: 1, OBJECT_INIT: 1, GROUP: 1
        };

        // Map operator type code to arity.
        for(i in opArity)
        {
            opArity[GLOBAL[i]] = opArity[i];
        }

        function Expression(t, x, stop){
            var n, id, tt, operators = [], operands = [];
            var bl = x.bracketLevel, cl = x.curlyLevel, pl = x.parenLevel,
                    hl = x.hookLevel;

            function reduce(){
                var n = operators.pop();
                var op = n.type;
                var arity = opArity[op];
                if(arity == -2){
                    // Flatten left-associative trees.
                    var left = operands.length >= 2 && operands[operands.length - 2];
                    if(left.type == op){
                        var right = operands.pop();
                        left.push(right);
                        return left;
                    }
                    arity = 2;
                }

                // Always use push to add operands to n, to update start and end.
                var a = operands.splice(operands.length - arity);
                for(var i = 0; i < arity; i++)
                {
                    n.push(a[i]);
                }

                // Include closing bracket or postfix operator in [start,end).
                if(n.end < t.token.end)
                {
                    n.end = t.token.end;
                }

                operands.push(n);
                return n;
            }

            loop:
                    while((tt = t.get()) != END){
                        if(tt == stop &&
                           x.bracketLevel == bl && x.curlyLevel == cl && x.parenLevel == pl &&
                           x.hookLevel == hl){
                            // Stop only if tt matches the optional stop parameter, and that
                            // token is not quoted by some kind of bracket.
                            break;
                        }
                        switch(tt){
                            case SEMICOLON:
                                // NB: cannot be empty, Statement handled that.
                                break loop;

                            //todo: https://bugzilla.mozilla.org/show_bug.cgi?id=330975
                            case ASSIGN:
                            case HOOK:
                            case COLON:
                                if(t.scanOperand)
                                {
                                    break loop;
                                }
                                // Use >, not >=, for right-associative ASSIGN and HOOK/COLON.
                                while(opPrecedence[operators.top().type] > opPrecedence[tt] ||
                                      (tt == COLON && operators.top().type == ASSIGN)){
                                    reduce();
                                }
                                if(tt == COLON){
                                    n = operators.top();
                                    if(n.type != HOOK)
                                    {
                                        throw t.newSyntaxError("Invalid label");
                                    }
                                    --x.hookLevel;
                                }
                                else{
                                    operators.push(new Node(t));
                                    if(tt == ASSIGN)
                                    {
                                        operands.top().assignOp = t.token.assignOp;
                                    }
                                    else
                                    {
                                        ++x.hookLevel;
                                    }      // tt == HOOK
                                }
                                t.scanOperand = true;
                                break;

                            case IN:
                                // An in operator should not be parsed if we're parsing the head of
                                // a for (...) loop, unless it is in the then part of a conditional
                                // expression, or parenthesized somehow.
                                if(x.inForLoopInit && !x.hookLevel &&
                                   !x.bracketLevel && !x.curlyLevel && !x.parenLevel){
                                    break loop;
                                }
                            // FALL THROUGH
                            case COMMA:
                            // Treat comma as left-associative so reduce can fold left-heavy
                            // COMMA trees into a single array.
                            // FALL THROUGH
                            case OR:
                            case AND:
                            case BITWISE_OR:
                            case BITWISE_XOR:
                            case BITWISE_AND:
                            case EQ: case NE: case STRICT_EQ: case STRICT_NE:
                            case LT: case LE: case GE: case GT:
                            case INSTANCEOF:
                            case LSH: case RSH: case URSH:
                            case PLUS: case MINUS:
                            case MUL: case DIV: case MOD:
                            case DOT:
                                if(t.scanOperand)
                                {
                                    break loop;
                                }
                                while(opPrecedence[operators.top().type] >= opPrecedence[tt])
                                {
                                    reduce();
                                }
                                if(tt == DOT){
                                    t.mustMatch(IDENTIFIER);
                                    operands.push(new Node(t, DOT, operands.pop(), new Node(t)));
                                }
                                else{
                                    operators.push(new Node(t));
                                    t.scanOperand = true;
                                }
                                break;

                            case DELETE: case VOID: case TYPEOF:
                            case NOT: case BITWISE_NOT: case UNARY_PLUS: case UNARY_MINUS:
                            case NEW:
                                if(!t.scanOperand)
                                {
                                    break loop;
                                }
                                operators.push(new Node(t));
                                break;

                            case INCREMENT: case DECREMENT:
                            if(t.scanOperand){
                                operators.push(new Node(t));  // prefix increment or decrement
                            }
                            else{
                                // Don't cross a line boundary for postfix {in,de}crement.
                                if(t.tokens[(t.tokenIndex + t.lookahead - 1) & 3].lineno !=
                                   t.lineno){
                                    break loop;
                                }

                                // Use >, not >=, so postfix has higher precedence than prefix.
                                while(opPrecedence[operators.top().type] > opPrecedence[tt])
                                {
                                    reduce();
                                }
                                n = new Node(t, tt, operands.pop());
                                n.postfix = true;
                                operands.push(n);
                            }
                            break;

                            case FUNCTION:
                                if(!t.scanOperand)
                                {
                                    break loop;
                                }
                                operands.push(FunctionDefinition(t, x, false, EXPRESSED_FORM));
                                t.scanOperand = false;
                                break;

                            case NULL: case THIS: case TRUE: case FALSE:
                            case IDENTIFIER: case NUMBER: case STRING: case REGEXP:
                            if(!t.scanOperand)
                            {
                                break loop;
                            }
                            operands.push(new Node(t));
                            t.scanOperand = false;
                            break;

                            case LEFT_BRACKET:
                                if(t.scanOperand){
                                    // Array initialiser.  Parse using recursive descent, as the
                                    // sub-grammar here is not an operator grammar.
                                    n = new Node(t, ARRAY_INIT);
                                    while((tt = t.peek()) != RIGHT_BRACKET){
                                        if(tt == COMMA){
                                            t.get();
                                            n.push(null);
                                            continue;
                                        }
                                        n.push(Expression(t, x, COMMA));
                                        if(!t.match(COMMA))
                                        {
                                            break;
                                        }
                                    }
                                    t.mustMatch(RIGHT_BRACKET);
                                    operands.push(n);
                                    t.scanOperand = false;
                                }
                                else{
                                    // Property indexing operator.
                                    operators.push(new Node(t, INDEX));
                                    t.scanOperand = true;
                                    ++x.bracketLevel;
                                }
                                break;

                            case RIGHT_BRACKET:
                                if(t.scanOperand || x.bracketLevel == bl)
                                {
                                    break loop;
                                }
                                while(reduce().type != INDEX)
                                {
                                    continue;
                                }
                                --x.bracketLevel;
                                break;

                            case LEFT_CURLY:
                                if(!t.scanOperand)
                                {
                                    break loop;
                                }
                                // Object initialiser.  As for array initialisers (see above),
                                // parse using recursive descent.
                                ++x.curlyLevel;
                                n = new Node(t, OBJECT_INIT);
                                object_init:
                                        if(!t.match(RIGHT_CURLY)){
                                            do {
                                                tt = t.get();
                                                if((t.token.value == "get" || t.token.value == "set") &&
                                                   t.peek() == IDENTIFIER){
                                                    if(x.ecmaStrictMode)
                                                    {
                                                        throw t.newSyntaxError("Illegal property accessor");
                                                    }
                                                    n.push(FunctionDefinition(t, x, true, EXPRESSED_FORM));
                                                }
                                                else{
                                                    switch(tt){
                                                        case IDENTIFIER:
                                                        case NUMBER:
                                                        case STRING:
                                                            id = new Node(t);
                                                            break;
                                                        case RIGHT_CURLY:
                                                            if(x.ecmaStrictMode)
                                                            {
                                                                throw t.newSyntaxError("Illegal trailing ,");
                                                            }
                                                            break object_init;
                                                        default:
                                                            throw t.newSyntaxError("Invalid property name");
                                                    }
                                                    t.mustMatch(COLON);
                                                    n.push(new Node(t, PROPERTY_INIT, id,
                                                                    Expression(t, x, COMMA)));
                                                }
                                            } while(t.match(COMMA));
                                            t.mustMatch(RIGHT_CURLY);
                                        }
                                operands.push(n);
                                t.scanOperand = false;
                                --x.curlyLevel;
                                break;

                            case RIGHT_CURLY:
                                if(!t.scanOperand && x.curlyLevel != cl)
                                {
                                    throw "PANIC: right curly botch";
                                }
                                break loop;

                            case LEFT_PAREN:
                                if(t.scanOperand){
                                    operators.push(new Node(t, GROUP));
                                }
                                else{
                                    while(opPrecedence[operators.top().type] > opPrecedence[NEW])
                                    {
                                        reduce();
                                    }

                                    // Handle () now, to regularize the n-ary case for n > 0.
                                    // We must set scanOperand in case there are arguments and
                                    // the first one is a regexp or unary+/-.
                                    n = operators.top();
                                    t.scanOperand = true;
                                    if(t.match(RIGHT_PAREN)){
                                        if(n.type == NEW){
                                            --operators.length;
                                            n.push(operands.pop());
                                        }
                                        else{
                                            n = new Node(t, CALL, operands.pop(),
                                                         new Node(t, LIST));
                                        }
                                        operands.push(n);
                                        t.scanOperand = false;
                                        break;
                                    }
                                    if(n.type == NEW)
                                    {
                                        n.type = NEW_WITH_ARGS;
                                    }
                                    else
                                    {
                                        operators.push(new Node(t, CALL));
                                    }
                                }
                                ++x.parenLevel;
                                break;

                            case RIGHT_PAREN:
                                if(t.scanOperand || x.parenLevel == pl)
                                {
                                    break loop;
                                }
                                while((tt = reduce().type) != GROUP && tt != CALL &&
                                      tt != NEW_WITH_ARGS){
                                    continue;
                                }
                                if(tt != GROUP){
                                    n = operands.top();
                                    if(n[1].type != COMMA)
                                    {
                                        n[1] = new Node(t, LIST, n[1]);
                                    }
                                    else
                                    {
                                        n[1].type = LIST;
                                    }
                                }
                                --x.parenLevel;
                                break;

                            // Automatic semicolon insertion means we may scan across a newline
                            // and into the beginning of another statement.  If so, break out of
                            // the while loop and let the t.scanOperand logic handle errors.
                            default:
                                break loop;
                        }
                    }

            if(x.hookLevel != hl)
            {
                throw t.newSyntaxError("Missing : after ?");
            }
            if(x.parenLevel != pl)
            {
                throw t.newSyntaxError("Missing ) in parenthetical");
            }
            if(x.bracketLevel != bl)
            {
                throw t.newSyntaxError("Missing ] in index expression");
            }
            if(t.scanOperand)
            {
                throw t.newSyntaxError("Missing operand");
            }

            // Resume default mode, scanning for operands, not operators.
            t.scanOperand = true;
            t.unget();
            while(operators.length)
            {
                reduce();
            }
            return operands.pop();
        }

        this.parse = function(s, f, l){
            var t = new Tokenizer(s, f, l);
            var x = new CompilerContext(false);
            var n = Script(t, x);
            if(!t.done)
            {
                throw t.newSyntaxError("Syntax error");
            }
            return n;
        }
    }

    //singleton
    return new Constructor();

}();
