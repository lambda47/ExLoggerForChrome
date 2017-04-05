var Tool = {
    inArray: function(val, arr) {
        for(var i = 0; i < arr.length; i++) {
            if (val.toUpperCase() === arr[i].toUpperCase()) {
                return true;
            }
        }
        return false;
    },
    // 判断字符是否为字符串分隔符
    isStrDelimiter: function(char) {
        return char === "'" || char === '"';
    },
    // 判断字符是否为反斜杠
    isBackSlash: function(char) {
        return char === '\\';
    }
};

var Token = function(type, content) {
    this.type = type;
    this.content = content;
};
Token.prototype.isString = function() {
    return this.type === 'string';
};
Token.prototype.isNumber = function() {
    return this.type === 'number';
};
Token.prototype.isSymbol = function() {
    return this.type === 'symbol';
};
Token.prototype.isIdentifier = function() {
    return this.type === 'identifier';
};
Token.prototype.isKeyword = function() {
    return this.type === 'keyword';
};
Token.prototype.isFunction = function() {
    return this.type === 'function';
};

var Parser = function(sql, time) {
    this.sql = sql;
    this.sqlLen = sql.length;
    this.time = time;
    this.pos = 0;

    this.token = '';
    this.tokens = [];

    // 字符串分隔符('或")
    this.strDelimiter = '';
    // token是否为未达到总结状态的字符串
    this.stateString = false;
    // token是否为字符串
    this.isStringToken = false;

    // 小数点个数
    this.decimalPointNum = 0;
    // token是否为数字
    this.isNumberToken = true;

    // token是否为界符或运算符
    this.isSymbolToken = false;
};

// 获取字符流当前字符
Parser.prototype.getChar = function() {
    if (this.pos >= this.sqlLen) {
        return false;
    } else {
        return this.sql[this.pos];
    }
};

// 获取字符流上一个字符
Parser.prototype.getPrevChar = function() {
    if (this.pos - 1 < 0) {
        return false;
    } else {
        return this.sql[this.pos - 1];
    }
};

// 获取字符流下一个字符
Parser.prototype.getNextChar = function() {
    if (this.pos + 1 >= this.sqlLen) {
        return false;
    } else {
        return this.sql[this.pos + 1];
    }
};

// 从字符流读取一个字符添加到当前单词中
Parser.prototype.readChar = function() {
    var char = this.getChar();
    if (char) {
        this.checkStateString(char);
        this.checkStateNumber(char);
        this.token += char;
        this.pos++;
    }
};

// 判断单词是否为符号
Parser.prototype.isSymbol = function(char) {
    if (this.stateString) {
        return false;
    } else {
        return Tool.inArray(char, symbols);
    }
};

// 判断当前解析单词是否为关键字
Parser.prototype.tokenIsKeyword = function() {
    return Tool.inArray(this.token, keywords);
};

// 判断当前解析单词是否为函数
Parser.prototype.tokenIsFunction = function() {
    return Tool.inArray(this.token, functions);
};


// 获取已解析单词
Parser.prototype.parseFromToken = function() {
    if (this.token !== '') {
        var type;
        if (this.isSymbolToken) {
            type = 'symbol';
        } else if (this.isNumberToken) {
            type = 'number';
        } else if (this.isStringToken) {
            type = 'string';
        } else if (this.tokenIsKeyword()) {
            type = 'keyword';
        } else if (this.tokenIsFunction()) {
            type = 'function';
        } else {
            type = 'identifier';
        }
        this.tokens.push(new Token(type, this.token));
        this.token = '';

        this.strDelimiter = '';
        this.stateString = false;
        this.isStringToken = false;

        this.decimalPointNum = 0;
        this.isNumberToken = true;

        this.isSymbolToken = false;
    }
};

// 设置当前状态是否在字符串的转移状态中
Parser.prototype.checkStateString = function(char) {
    if (Tool.isStrDelimiter(char)) {
        if (this.stateString) {
            var prevChar = this.getPrevChar();
            if (char === this.strDelimiter && !(prevChar && Tool.isBackSlash(prevChar))) {
                this.strDelimiter = '';
                this.stateString = false;
                this.isStringToken = true;
            }
        } else {
            this.strDelimiter = char;
            this.stateString = true;
        }
    }
};

// 设置当前状态是否在数字的转移状态中
Parser.prototype.checkStateNumber = function(char) {
    if (this.isNumberToken) {
        if (char === '.') {
            this.decimalPointNum++;
            if (this.decimalPointNum >= 1) {
                this.decimalPointNum = 0;
                this.isNumberToken = false;
            }
        } else if (char < '0' || char > '9') {
            this.decimalPointNum = 0;
            this.isNumberToken = false;
        }
    }
};
// 词法分析
Parser.prototype.parse = function() {
    if (this.sqlLen > 0) {
        while (true) {
            var char = this.getChar();
            if (!char) { // 所有字符已解析完毕
                this.parseFromToken();
                break;
            }
            var nextChar = this.getNextChar();
            if (nextChar && this.isSymbol(char + nextChar)) { // 2个字符的界符或运算符
                this.parseFromToken();
                this.readChar();
                this.readChar();
                this.isSymbolToken = true;
                this.parseFromToken();
            } else if (this.isSymbol(char)) { // 1个字符的界符或运算符
                this.parseFromToken();
                this.readChar();
                this.isSymbolToken = true;
                this.parseFromToken();
            } else { // 界符和运算符以外的字符
                this.readChar();
            }
        }
    }
};
// 高亮显示
Parser.prototype.display = function() {
    var format = '';
    var params = [];
    for (var i in this.tokens) {
        format += '%c%s';
        if (this.tokens[i].isNumber()) {
            params.push('color:#f57f17');
        }else if (this.tokens[i].isString()) {
            params.push('color:#33b877');
        } else if (this.tokens[i].isKeyword()) {
            params.push('color:#cf181d');
        } else if (this.tokens[i].isFunction()) {
            params.push('color:#436eb3');
        } else if (this.tokens[i].isSymbol()) {
            params.push('color:#ee99ff');
        } else {
            params.push('color:#000000');
        }
        params.push(this.tokens[i].content);
    }
    format += '%c(%f second)';
    params.push('color:#000000;font-weight:bold');
    params.push(this.time);
    params.unshift(format);
    console.log.apply(console, params);
};