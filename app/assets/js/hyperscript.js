(function (e, t) {
  const r = t(e);
  if (typeof exports === "object" && typeof exports["nodeName"] !== "string") {
    module.exports = r;
  } else {
    e["_hyperscript"] = r;
    if ("document" in e) e["_hyperscript"].browserInit();
  }
})(typeof self !== "undefined" ? self : this, (e) => {
  "use strict";
  const t = {
    dynamicResolvers: [
      function (e, t) {
        if (e === "Fixed") {
          return Number(t).toFixed();
        } else if (e.indexOf("Fixed:") === 0) {
          let r = e.split(":")[1];
          return Number(t).toFixed(parseInt(r));
        }
      },
    ],
    String: function (e) {
      if (e.toString) {
        return e.toString();
      } else {
        return "" + e;
      }
    },
    Int: function (e) {
      return parseInt(e);
    },
    Float: function (e) {
      return parseFloat(e);
    },
    Number: function (e) {
      return Number(e);
    },
    Date: function (e) {
      return new Date(e);
    },
    Array: function (e) {
      return Array.from(e);
    },
    JSON: function (e) {
      return JSON.stringify(e);
    },
    Object: function (e) {
      if (e instanceof String) {
        e = e.toString();
      }
      if (typeof e === "string") {
        return JSON.parse(e);
      } else {
        return Object.assign({}, e);
      }
    },
  };
  const r = {
    attributes: "_, script, data-script",
    defaultTransition: "all 500ms ease-in",
    disableSelector: "[disable-scripting], [data-disable-scripting]",
    hideShowStrategies: {},
    conversions: t,
  };
  class n {
    static OP_TABLE = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "MULTIPLY",
      "/": "DIVIDE",
      ".": "PERIOD",
      "..": "ELLIPSIS",
      "\\": "BACKSLASH",
      ":": "COLON",
      "%": "PERCENT",
      "|": "PIPE",
      "!": "EXCLAMATION",
      "?": "QUESTION",
      "#": "POUND",
      "&": "AMPERSAND",
      $: "DOLLAR",
      ";": "SEMI",
      ",": "COMMA",
      "(": "L_PAREN",
      ")": "R_PAREN",
      "<": "L_ANG",
      ">": "R_ANG",
      "<=": "LTE_ANG",
      ">=": "GTE_ANG",
      "==": "EQ",
      "===": "EQQ",
      "!=": "NEQ",
      "!==": "NEQQ",
      "{": "L_BRACE",
      "}": "R_BRACE",
      "[": "L_BRACKET",
      "]": "R_BRACKET",
      "=": "EQUALS",
    };
    static isValidCSSClassChar(e) {
      return (
        n.isAlpha(e) || n.isNumeric(e) || e === "-" || e === "_" || e === ":"
      );
    }
    static isValidCSSIDChar(e) {
      return (
        n.isAlpha(e) || n.isNumeric(e) || e === "-" || e === "_" || e === ":"
      );
    }
    static isWhitespace(e) {
      return e === " " || e === "\t" || n.isNewline(e);
    }
    static positionString(e) {
      return "[Line: " + e.line + ", Column: " + e.column + "]";
    }
    static isNewline(e) {
      return e === "\r" || e === "\n";
    }
    static isNumeric(e) {
      return e >= "0" && e <= "9";
    }
    static isAlpha(e) {
      return (e >= "a" && e <= "z") || (e >= "A" && e <= "Z");
    }
    static isIdentifierChar(e, t) {
      return e === "_" || e === "$";
    }
    static isReservedChar(e) {
      return e === "`" || e === "^";
    }
    static isValidSingleQuoteStringStart(e) {
      if (e.length > 0) {
        var t = e[e.length - 1];
        if (
          t.type === "IDENTIFIER" ||
          t.type === "CLASS_REF" ||
          t.type === "ID_REF"
        ) {
          return false;
        }
        if (t.op && (t.value === ">" || t.value === ")")) {
          return false;
        }
      }
      return true;
    }
    static tokenize(e, t) {
      var r = [];
      var a = e;
      var o = 0;
      var s = 0;
      var u = 1;
      var l = "<START>";
      var c = 0;
      function f() {
        return t && c === 0;
      }
      while (o < a.length) {
        if (
          (q() === "-" &&
            N() === "-" &&
            (n.isWhitespace(I(2)) || I(2) === "" || I(2) === "-")) ||
          (q() === "/" &&
            N() === "/" &&
            (n.isWhitespace(I(2)) || I(2) === "" || I(2) === "/"))
        ) {
          h();
        } else if (
          q() === "/" &&
          N() === "*" &&
          (n.isWhitespace(I(2)) || I(2) === "" || I(2) === "*")
        ) {
          v();
        } else {
          if (n.isWhitespace(q())) {
            r.push(A());
          } else if (
            !R() &&
            q() === "." &&
            (n.isAlpha(N()) || N() === "{" || N() === "-")
          ) {
            r.push(d());
          } else if (!R() && q() === "#" && (n.isAlpha(N()) || N() === "{")) {
            r.push(k());
          } else if (q() === "[" && N() === "@") {
            r.push(E());
          } else if (q() === "@") {
            r.push(T());
          } else if (q() === "*" && n.isAlpha(N())) {
            r.push(y());
          } else if (n.isAlpha(q()) || (!f() && n.isIdentifierChar(q()))) {
            r.push(x());
          } else if (n.isNumeric(q())) {
            r.push(g());
          } else if (!f() && (q() === '"' || q() === "`")) {
            r.push(w());
          } else if (!f() && q() === "'") {
            if (n.isValidSingleQuoteStringStart(r)) {
              r.push(w());
            } else {
              r.push(b());
            }
          } else if (n.OP_TABLE[q()]) {
            if (l === "$" && q() === "{") {
              c++;
            }
            if (q() === "}") {
              c--;
            }
            r.push(b());
          } else if (f() || n.isReservedChar(q())) {
            r.push(p("RESERVED", C()));
          } else {
            if (o < a.length) {
              throw Error("Unknown token: " + q() + " ");
            }
          }
        }
      }
      return new i(r, [], a);
      function m(e, t) {
        var r = p(e, t);
        r.op = true;
        return r;
      }
      function p(e, t) {
        return {
          type: e,
          value: t || "",
          start: o,
          end: o + 1,
          column: s,
          line: u,
        };
      }
      function h() {
        while (q() && !n.isNewline(q())) {
          C();
        }
        C();
      }
      function v() {
        while (q() && !(q() === "*" && N() === "/")) {
          C();
        }
        C();
        C();
      }
      function d() {
        var e = p("CLASS_REF");
        var t = C();
        if (q() === "{") {
          e.template = true;
          t += C();
          while (q() && q() !== "}") {
            t += C();
          }
          if (q() !== "}") {
            throw Error("Unterminated class reference");
          } else {
            t += C();
          }
        } else {
          while (n.isValidCSSClassChar(q())) {
            t += C();
          }
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function E() {
        var e = p("ATTRIBUTE_REF");
        var t = C();
        while (o < a.length && q() !== "]") {
          t += C();
        }
        if (q() === "]") {
          t += C();
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function T() {
        var e = p("ATTRIBUTE_REF");
        var t = C();
        while (n.isValidCSSIDChar(q())) {
          t += C();
        }
        if (q() === "=") {
          t += C();
          if (q() === '"' || q() === "'") {
            let e = w();
            t += e.value;
          } else if (
            n.isAlpha(q()) ||
            n.isNumeric(q()) ||
            n.isIdentifierChar(q())
          ) {
            let e = x();
            t += e.value;
          }
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function y() {
        var e = p("STYLE_REF");
        var t = C();
        while (n.isAlpha(q()) || q() === "-") {
          t += C();
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function k() {
        var e = p("ID_REF");
        var t = C();
        if (q() === "{") {
          e.template = true;
          t += C();
          while (q() && q() !== "}") {
            t += C();
          }
          if (q() !== "}") {
            throw Error("Unterminated id reference");
          } else {
            C();
          }
        } else {
          while (n.isValidCSSIDChar(q())) {
            t += C();
          }
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function x() {
        var e = p("IDENTIFIER");
        var t = C();
        while (n.isAlpha(q()) || n.isNumeric(q()) || n.isIdentifierChar(q())) {
          t += C();
        }
        if (q() === "!" && t === "beep") {
          t += C();
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function g() {
        var e = p("NUMBER");
        var t = C();
        while (n.isNumeric(q())) {
          t += C();
        }
        if (q() === "." && n.isNumeric(N())) {
          t += C();
        }
        while (n.isNumeric(q())) {
          t += C();
        }
        if (q() === "e" || q() === "E") {
          if (n.isNumeric(N())) {
            t += C();
          } else if (N() === "-") {
            t += C();
            t += C();
          }
        }
        while (n.isNumeric(q())) {
          t += C();
        }
        e.value = t;
        e.end = o;
        return e;
      }
      function b() {
        var e = m();
        var t = C();
        while (q() && n.OP_TABLE[t + q()]) {
          t += C();
        }
        e.type = n.OP_TABLE[t];
        e.value = t;
        e.end = o;
        return e;
      }
      function w() {
        var e = p("STRING");
        var t = C();
        var r = "";
        while (q() && q() !== t) {
          if (q() === "\\") {
            C();
            let t = C();
            if (t === "b") {
              r += "\b";
            } else if (t === "f") {
              r += "\f";
            } else if (t === "n") {
              r += "\n";
            } else if (t === "r") {
              r += "\r";
            } else if (t === "t") {
              r += "\t";
            } else if (t === "v") {
              r += "\v";
            } else if (t === "x") {
              const t = S();
              if (Number.isNaN(t)) {
                throw Error(
                  "Invalid hexadecimal escape at " + n.positionString(e)
                );
              }
              r += String.fromCharCode(t);
            } else {
              r += t;
            }
          } else {
            r += C();
          }
        }
        if (q() !== t) {
          throw Error("Unterminated string at " + n.positionString(e));
        } else {
          C();
        }
        e.value = r;
        e.end = o;
        e.template = t === "`";
        return e;
      }
      function S() {
        const e = 16;
        if (!q()) {
          return NaN;
        }
        let t = e * Number.parseInt(C(), e);
        if (!q()) {
          return NaN;
        }
        t += Number.parseInt(C(), e);
        return t;
      }
      function q() {
        return a.charAt(o);
      }
      function N() {
        return a.charAt(o + 1);
      }
      function I(e = 1) {
        return a.charAt(o + e);
      }
      function C() {
        l = q();
        o++;
        s++;
        return l;
      }
      function R() {
        return (
          n.isAlpha(l) ||
          n.isNumeric(l) ||
          l === ")" ||
          l === '"' ||
          l === "'" ||
          l === "`" ||
          l === "}" ||
          l === "]"
        );
      }
      function A() {
        var e = p("WHITESPACE");
        var t = "";
        while (q() && n.isWhitespace(q())) {
          if (n.isNewline(q())) {
            s = 0;
            u++;
          }
          t += C();
        }
        e.value = t;
        e.end = o;
        return e;
      }
    }
    tokenize(e, t) {
      return n.tokenize(e, t);
    }
  }
  class i {
    constructor(e, t, r) {
      this.tokens = e;
      this.consumed = t;
      this.source = r;
      this.consumeWhitespace();
    }
    get list() {
      return this.tokens;
    }
    _lastConsumed = null;
    consumeWhitespace() {
      while (this.token(0, true).type === "WHITESPACE") {
        this.consumed.push(this.tokens.shift());
      }
    }
    raiseError(e, t) {
      a.raiseParseError(e, t);
    }
    requireOpToken(e) {
      var t = this.matchOpToken(e);
      if (t) {
        return t;
      } else {
        this.raiseError(
          this,
          "Expected '" + e + "' but found '" + this.currentToken().value + "'"
        );
      }
    }
    matchAnyOpToken(e, t, r) {
      for (var n = 0; n < arguments.length; n++) {
        var i = arguments[n];
        var a = this.matchOpToken(i);
        if (a) {
          return a;
        }
      }
    }
    matchAnyToken(e, t, r) {
      for (var n = 0; n < arguments.length; n++) {
        var i = arguments[n];
        var a = this.matchToken(i);
        if (a) {
          return a;
        }
      }
    }
    matchOpToken(e) {
      if (
        this.currentToken() &&
        this.currentToken().op &&
        this.currentToken().value === e
      ) {
        return this.consumeToken();
      }
    }
    requireTokenType(e, t, r, n) {
      var i = this.matchTokenType(e, t, r, n);
      if (i) {
        return i;
      } else {
        this.raiseError(this, "Expected one of " + JSON.stringify([e, t, r]));
      }
    }
    matchTokenType(e, t, r, n) {
      if (
        this.currentToken() &&
        this.currentToken().type &&
        [e, t, r, n].indexOf(this.currentToken().type) >= 0
      ) {
        return this.consumeToken();
      }
    }
    requireToken(e, t) {
      var r = this.matchToken(e, t);
      if (r) {
        return r;
      } else {
        this.raiseError(
          this,
          "Expected '" + e + "' but found '" + this.currentToken().value + "'"
        );
      }
    }
    peekToken(e, t, r) {
      t = t || 0;
      r = r || "IDENTIFIER";
      if (
        this.tokens[t] &&
        this.tokens[t].value === e &&
        this.tokens[t].type === r
      ) {
        return this.tokens[t];
      }
    }
    matchToken(e, t) {
      if (this.follows.indexOf(e) !== -1) {
        return;
      }
      t = t || "IDENTIFIER";
      if (
        this.currentToken() &&
        this.currentToken().value === e &&
        this.currentToken().type === t
      ) {
        return this.consumeToken();
      }
    }
    consumeToken() {
      var e = this.tokens.shift();
      this.consumed.push(e);
      this._lastConsumed = e;
      this.consumeWhitespace();
      return e;
    }
    consumeUntil(e, t) {
      var r = [];
      var n = this.token(0, true);
      while (
        (t == null || n.type !== t) &&
        (e == null || n.value !== e) &&
        n.type !== "EOF"
      ) {
        var i = this.tokens.shift();
        this.consumed.push(i);
        r.push(n);
        n = this.token(0, true);
      }
      this.consumeWhitespace();
      return r;
    }
    lastWhitespace() {
      if (
        this.consumed[this.consumed.length - 1] &&
        this.consumed[this.consumed.length - 1].type === "WHITESPACE"
      ) {
        return this.consumed[this.consumed.length - 1].value;
      } else {
        return "";
      }
    }
    consumeUntilWhitespace() {
      return this.consumeUntil(null, "WHITESPACE");
    }
    hasMore() {
      return this.tokens.length > 0;
    }
    token(e, t) {
      var r;
      var n = 0;
      do {
        if (!t) {
          while (this.tokens[n] && this.tokens[n].type === "WHITESPACE") {
            n++;
          }
        }
        r = this.tokens[n];
        e--;
        n++;
      } while (e > -1);
      if (r) {
        return r;
      } else {
        return { type: "EOF", value: "<<<EOF>>>" };
      }
    }
    currentToken() {
      return this.token(0);
    }
    lastMatch() {
      return this._lastConsumed;
    }
    static sourceFor = function () {
      return this.programSource.substring(
        this.startToken.start,
        this.endToken.end
      );
    };
    static lineFor = function () {
      return this.programSource.split("\n")[this.startToken.line - 1];
    };
    follows = [];
    pushFollow(e) {
      this.follows.push(e);
    }
    popFollow() {
      this.follows.pop();
    }
    clearFollows() {
      var e = this.follows;
      this.follows = [];
      return e;
    }
    restoreFollows(e) {
      this.follows = e;
    }
  }
  class a {
    constructor(e) {
      this.runtime = e;
      this.possessivesDisabled = false;
      this.addGrammarElement("feature", function (e, t, r) {
        if (r.matchOpToken("(")) {
          var n = e.requireElement("feature", r);
          r.requireOpToken(")");
          return n;
        }
        var i = e.FEATURES[r.currentToken().value || ""];
        if (i) {
          return i(e, t, r);
        }
      });
      this.addGrammarElement("command", function (e, t, r) {
        if (r.matchOpToken("(")) {
          const t = e.requireElement("command", r);
          r.requireOpToken(")");
          return t;
        }
        var n = e.COMMANDS[r.currentToken().value || ""];
        let i;
        if (n) {
          i = n(e, t, r);
        } else if (r.currentToken().type === "IDENTIFIER") {
          i = e.parseElement("pseudoCommand", r);
        }
        if (i) {
          return e.parseElement("indirectStatement", r, i);
        }
        return i;
      });
      this.addGrammarElement("commandList", function (e, t, r) {
        if (r.hasMore()) {
          var n = e.parseElement("command", r);
          if (n) {
            r.matchToken("then");
            const t = e.parseElement("commandList", r);
            if (t) n.next = t;
            return n;
          }
        }
        return {
          type: "emptyCommandListCommand",
          op: function (e) {
            return t.findNext(this, e);
          },
          execute: function (e) {
            return t.unifiedExec(this, e);
          },
        };
      });
      this.addGrammarElement("leaf", function (e, t, r) {
        var n = e.parseAnyOf(e.LEAF_EXPRESSIONS, r);
        if (n == null) {
          return e.parseElement("symbol", r);
        }
        return n;
      });
      this.addGrammarElement("indirectExpression", function (e, t, r, n) {
        for (var i = 0; i < e.INDIRECT_EXPRESSIONS.length; i++) {
          var a = e.INDIRECT_EXPRESSIONS[i];
          n.endToken = r.lastMatch();
          var o = e.parseElement(a, r, n);
          if (o) {
            return o;
          }
        }
        return n;
      });
      this.addGrammarElement("indirectStatement", function (e, t, r, n) {
        if (r.matchToken("unless")) {
          n.endToken = r.lastMatch();
          var i = e.requireElement("expression", r);
          var a = {
            type: "unlessStatementModifier",
            args: [i],
            op: function (e, t) {
              if (t) {
                return this.next;
              } else {
                return n;
              }
            },
            execute: function (e) {
              return t.unifiedExec(this, e);
            },
          };
          n.parent = a;
          return a;
        }
        return n;
      });
      this.addGrammarElement("primaryExpression", function (e, t, r) {
        var n = e.parseElement("leaf", r);
        if (n) {
          return e.parseElement("indirectExpression", r, n);
        }
        e.raiseParseError(r, "Unexpected value: " + r.currentToken().value);
      });
    }
    use(e) {
      e(this);
      return this;
    }
    GRAMMAR = {};
    COMMANDS = {};
    FEATURES = {};
    LEAF_EXPRESSIONS = [];
    INDIRECT_EXPRESSIONS = [];
    initElt(e, t, r) {
      e.startToken = t;
      e.sourceFor = i.sourceFor;
      e.lineFor = i.lineFor;
      e.programSource = r.source;
    }
    parseElement(e, t, r = undefined) {
      var n = this.GRAMMAR[e];
      if (n) {
        var i = t.currentToken();
        var a = n(this, this.runtime, t, r);
        if (a) {
          this.initElt(a, i, t);
          a.endToken = a.endToken || t.lastMatch();
          var r = a.root;
          while (r != null) {
            this.initElt(r, i, t);
            r = r.root;
          }
        }
        return a;
      }
    }
    requireElement(e, t, r, n) {
      var i = this.parseElement(e, t, n);
      if (!i) a.raiseParseError(t, r || "Expected " + e);
      return i;
    }
    parseAnyOf(e, t) {
      for (var r = 0; r < e.length; r++) {
        var n = e[r];
        var i = this.parseElement(n, t);
        if (i) {
          return i;
        }
      }
    }
    addGrammarElement(e, t) {
      this.GRAMMAR[e] = t;
    }
    addCommand(e, t) {
      var r = e + "Command";
      var n = function (e, n, i) {
        const a = t(e, n, i);
        if (a) {
          a.type = r;
          a.execute = function (e) {
            e.meta.command = a;
            return n.unifiedExec(this, e);
          };
          return a;
        }
      };
      this.GRAMMAR[r] = n;
      this.COMMANDS[e] = n;
    }
    addFeature(e, t) {
      var r = e + "Feature";
      var n = function (n, i, a) {
        var o = t(n, i, a);
        if (o) {
          o.isFeature = true;
          o.keyword = e;
          o.type = r;
          return o;
        }
      };
      this.GRAMMAR[r] = n;
      this.FEATURES[e] = n;
    }
    addLeafExpression(e, t) {
      this.LEAF_EXPRESSIONS.push(e);
      this.addGrammarElement(e, t);
    }
    addIndirectExpression(e, t) {
      this.INDIRECT_EXPRESSIONS.push(e);
      this.addGrammarElement(e, t);
    }
    static createParserContext(e) {
      var t = e.currentToken();
      var r = e.source;
      var n = r.split("\n");
      var i = t && t.line ? t.line - 1 : n.length - 1;
      var a = n[i];
      var o = t && t.line ? t.column : a.length - 1;
      return a + "\n" + " ".repeat(o) + "^^\n\n";
    }
    static raiseParseError(e, t) {
      t =
        (t || "Unexpected Token : " + e.currentToken().value) +
        "\n\n" +
        a.createParserContext(e);
      var r = new Error(t);
      r["tokens"] = e;
      throw r;
    }
    raiseParseError(e, t) {
      a.raiseParseError(e, t);
    }
    parseHyperScript(e) {
      var t = this.parseElement("hyperscript", e);
      if (e.hasMore()) this.raiseParseError(e);
      if (t) return t;
    }
    setParent(e, t) {
      if (typeof e === "object") {
        e.parent = t;
        if (typeof t === "object") {
          t.children = t.children || new Set();
          t.children.add(e);
        }
        this.setParent(e.next, t);
      }
    }
    commandStart(e) {
      return this.COMMANDS[e.value || ""];
    }
    featureStart(e) {
      return this.FEATURES[e.value || ""];
    }
    commandBoundary(e) {
      if (
        e.value == "end" ||
        e.value == "then" ||
        e.value == "else" ||
        e.value == "otherwise" ||
        e.value == ")" ||
        this.commandStart(e) ||
        this.featureStart(e) ||
        e.type == "EOF"
      ) {
        return true;
      }
      return false;
    }
    parseStringTemplate(e) {
      var t = [""];
      do {
        t.push(e.lastWhitespace());
        if (e.currentToken().value === "$") {
          e.consumeToken();
          var r = e.matchOpToken("{");
          t.push(this.requireElement("expression", e));
          if (r) {
            e.requireOpToken("}");
          }
          t.push("");
        } else if (e.currentToken().value === "\\") {
          e.consumeToken();
          e.consumeToken();
        } else {
          var n = e.consumeToken();
          t[t.length - 1] += n ? n.value : "";
        }
      } while (e.hasMore());
      t.push(e.lastWhitespace());
      return t;
    }
    ensureTerminated(e) {
      const t = this.runtime;
      var r = {
        type: "implicitReturn",
        op: function (e) {
          e.meta.returned = true;
          if (e.meta.resolve) {
            e.meta.resolve();
          }
          return t.HALT;
        },
        execute: function (e) {},
      };
      var n = e;
      while (n.next) {
        n = n.next;
      }
      n.next = r;
    }
  }
  class o {
    constructor(e, t) {
      this.lexer = e ?? new n();
      this.parser = t ?? new a(this).use(T).use(y);
      this.parser.runtime = this;
    }
    matchesSelector(e, t) {
      var r =
        e.matches ||
        e.matchesSelector ||
        e.msMatchesSelector ||
        e.mozMatchesSelector ||
        e.webkitMatchesSelector ||
        e.oMatchesSelector;
      return r && r.call(e, t);
    }
    makeEvent(t, r) {
      var n;
      if (e.Event && typeof e.Event === "function") {
        n = new Event(t, { bubbles: true, cancelable: true });
        n["detail"] = r;
      } else {
        n = document.createEvent("CustomEvent");
        n.initCustomEvent(t, true, true, r);
      }
      return n;
    }
    triggerEvent(e, t, r, n) {
      r = r || {};
      r["sender"] = n;
      var i = this.makeEvent(t, r);
      var a = e.dispatchEvent(i);
      return a;
    }
    isArrayLike(e) {
      return (
        Array.isArray(e) ||
        (typeof NodeList !== "undefined" &&
          (e instanceof NodeList || e instanceof HTMLCollection))
      );
    }
    isIterable(e) {
      return (
        typeof e === "object" &&
        Symbol.iterator in e &&
        typeof e[Symbol.iterator] === "function"
      );
    }
    shouldAutoIterate(e) {
      return (e != null && e[p]) || this.isArrayLike(e);
    }
    forEach(e, t) {
      if (e == null) {
      } else if (this.isIterable(e)) {
        for (const r of e) {
          t(r);
        }
      } else if (this.isArrayLike(e)) {
        for (var r = 0; r < e.length; r++) {
          t(e[r]);
        }
      } else {
        t(e);
      }
    }
    implicitLoop(e, t) {
      if (this.shouldAutoIterate(e)) {
        for (const r of e) t(r);
      } else {
        t(e);
      }
    }
    wrapArrays(e) {
      var t = [];
      for (var r = 0; r < e.length; r++) {
        var n = e[r];
        if (Array.isArray(n)) {
          t.push(Promise.all(n));
        } else {
          t.push(n);
        }
      }
      return t;
    }
    unwrapAsyncs(e) {
      for (var t = 0; t < e.length; t++) {
        var r = e[t];
        if (r.asyncWrapper) {
          e[t] = r.value;
        }
        if (Array.isArray(r)) {
          for (var n = 0; n < r.length; n++) {
            var i = r[n];
            if (i.asyncWrapper) {
              r[n] = i.value;
            }
          }
        }
      }
    }
    static HALT = {};
    HALT = o.HALT;
    unifiedExec(e, t) {
      while (true) {
        try {
          var r = this.unifiedEval(e, t);
        } catch (n) {
          if (t.meta.handlingFinally) {
            console.error(" Exception in finally block: ", n);
            r = o.HALT;
          } else {
            this.registerHyperTrace(t, n);
            if (t.meta.errorHandler && !t.meta.handlingError) {
              t.meta.handlingError = true;
              t.locals[t.meta.errorSymbol] = n;
              e = t.meta.errorHandler;
              continue;
            } else {
              t.meta.currentException = n;
              r = o.HALT;
            }
          }
        }
        if (r == null) {
          console.error(
            e,
            " did not return a next element to execute! context: ",
            t
          );
          return;
        } else if (r.then) {
          r.then((e) => {
            this.unifiedExec(e, t);
          }).catch((e) => {
            this.unifiedExec(
              {
                op: function () {
                  throw e;
                },
              },
              t
            );
          });
          return;
        } else if (r === o.HALT) {
          if (t.meta.finallyHandler && !t.meta.handlingFinally) {
            t.meta.handlingFinally = true;
            e = t.meta.finallyHandler;
          } else {
            if (t.meta.onHalt) {
              t.meta.onHalt();
            }
            if (t.meta.currentException) {
              if (t.meta.reject) {
                t.meta.reject(t.meta.currentException);
                return;
              } else {
                throw t.meta.currentException;
              }
            } else {
              return;
            }
          }
        } else {
          e = r;
        }
      }
    }
    unifiedEval(e, t) {
      var r = [t];
      var n = false;
      var i = false;
      if (e.args) {
        for (var a = 0; a < e.args.length; a++) {
          var o = e.args[a];
          if (o == null) {
            r.push(null);
          } else if (Array.isArray(o)) {
            var s = [];
            for (var u = 0; u < o.length; u++) {
              var l = o[u];
              var c = l ? l.evaluate(t) : null;
              if (c) {
                if (c.then) {
                  n = true;
                } else if (c.asyncWrapper) {
                  i = true;
                }
              }
              s.push(c);
            }
            r.push(s);
          } else if (o.evaluate) {
            var c = o.evaluate(t);
            if (c) {
              if (c.then) {
                n = true;
              } else if (c.asyncWrapper) {
                i = true;
              }
            }
            r.push(c);
          } else {
            r.push(o);
          }
        }
      }
      if (n) {
        return new Promise((t, n) => {
          r = this.wrapArrays(r);
          Promise.all(r)
            .then(function (r) {
              if (i) {
                this.unwrapAsyncs(r);
              }
              try {
                var a = e.op.apply(e, r);
                t(a);
              } catch (e) {
                n(e);
              }
            })
            .catch(function (e) {
              n(e);
            });
        });
      } else {
        if (i) {
          this.unwrapAsyncs(r);
        }
        return e.op.apply(e, r);
      }
    }
    _scriptAttrs = null;
    getScriptAttributes() {
      if (this._scriptAttrs == null) {
        this._scriptAttrs = r.attributes.replace(/ /g, "").split(",");
      }
      return this._scriptAttrs;
    }
    getScript(e) {
      for (var t = 0; t < this.getScriptAttributes().length; t++) {
        var r = this.getScriptAttributes()[t];
        if (e.hasAttribute && e.hasAttribute(r)) {
          return e.getAttribute(r);
        }
      }
      if (e instanceof HTMLScriptElement && e.type === "text/hyperscript") {
        return e.innerText;
      }
      return null;
    }
    hyperscriptFeaturesMap = new WeakMap();
    getHyperscriptFeatures(e) {
      var t = this.hyperscriptFeaturesMap.get(e);
      if (typeof t === "undefined") {
        if (e) {
          this.hyperscriptFeaturesMap.set(e, (t = {}));
        }
      }
      return t;
    }
    addFeatures(e, t) {
      if (e) {
        Object.assign(t.locals, this.getHyperscriptFeatures(e));
        this.addFeatures(e.parentElement, t);
      }
    }
    makeContext(e, t, r, n) {
      return new f(e, t, r, n, this);
    }
    getScriptSelector() {
      return this.getScriptAttributes()
        .map(function (e) {
          return "[" + e + "]";
        })
        .join(", ");
    }
    convertValue(e, r) {
      var n = t.dynamicResolvers;
      for (var i = 0; i < n.length; i++) {
        var a = n[i];
        var o = a(r, e);
        if (o !== undefined) {
          return o;
        }
      }
      if (e == null) {
        return null;
      }
      var s = t[r];
      if (s) {
        return s(e);
      }
      throw "Unknown conversion : " + r;
    }
    parse(e) {
      const t = this.lexer,
        r = this.parser;
      var n = t.tokenize(e);
      if (this.parser.commandStart(n.currentToken())) {
        var i = r.requireElement("commandList", n);
        if (n.hasMore()) r.raiseParseError(n);
        r.ensureTerminated(i);
        return i;
      } else if (r.featureStart(n.currentToken())) {
        var a = r.requireElement("hyperscript", n);
        if (n.hasMore()) r.raiseParseError(n);
        return a;
      } else {
        var o = r.requireElement("expression", n);
        if (n.hasMore()) r.raiseParseError(n);
        return o;
      }
    }
    evaluateNoPromise(e, t) {
      let r = e.evaluate(t);
      if (r.next) {
        throw new Error(
          i.sourceFor.call(e) +
            " returned a Promise in a context that they are not allowed."
        );
      }
      return r;
    }
    evaluate(t, r, n) {
      class i extends EventTarget {
        constructor(e) {
          super();
          this.module = e;
        }
        toString() {
          return this.module.id;
        }
      }
      var a = "document" in e ? e.document.body : new i(n && n.module);
      r = Object.assign(this.makeContext(a, null, a, null), r || {});
      var o = this.parse(t);
      if (o.execute) {
        o.execute(r);
        if (typeof r.meta.returnValue !== "undefined") {
          return r.meta.returnValue;
        } else {
          return r.result;
        }
      } else if (o.apply) {
        o.apply(a, a, n);
        return this.getHyperscriptFeatures(a);
      } else {
        return o.evaluate(r);
      }
      function s() {
        return {};
      }
    }
    processNode(e) {
      var t = this.getScriptSelector();
      if (this.matchesSelector(e, t)) {
        this.initElement(e, e);
      }
      if (e instanceof HTMLScriptElement && e.type === "text/hyperscript") {
        this.initElement(e, document.body);
      }
      if (e.querySelectorAll) {
        this.forEach(
          e.querySelectorAll(t + ", [type='text/hyperscript']"),
          (e) => {
            this.initElement(
              e,
              e instanceof HTMLScriptElement && e.type === "text/hyperscript"
                ? document.body
                : e
            );
          }
        );
      }
    }
    initElement(e, t) {
      if (e.closest && e.closest(r.disableSelector)) {
        return;
      }
      var n = this.getInternalData(e);
      if (!n.initialized) {
        var i = this.getScript(e);
        if (i) {
          try {
            n.initialized = true;
            n.script = i;
            const r = this.lexer,
              s = this.parser;
            var a = r.tokenize(i);
            var o = s.parseHyperScript(a);
            if (!o) return;
            o.apply(t || e, e);
            setTimeout(() => {
              this.triggerEvent(t || e, "load", { hyperscript: true });
            }, 1);
          } catch (t) {
            this.triggerEvent(e, "exception", { error: t });
            console.error(
              "hyperscript errors were found on the following element:",
              e,
              "\n\n",
              t.message,
              t.stack
            );
          }
        }
      }
    }
    internalDataMap = new WeakMap();
    getInternalData(e) {
      var t = this.internalDataMap.get(e);
      if (typeof t === "undefined") {
        this.internalDataMap.set(e, (t = {}));
      }
      return t;
    }
    typeCheck(e, t, r) {
      if (e == null && r) {
        return true;
      }
      var n = Object.prototype.toString.call(e).slice(8, -1);
      return n === t;
    }
    getElementScope(e) {
      var t = e.meta && e.meta.owner;
      if (t) {
        var r = this.getInternalData(t);
        var n = "elementScope";
        if (e.meta.feature && e.meta.feature.behavior) {
          n = e.meta.feature.behavior + "Scope";
        }
        var i = h(r, n);
        return i;
      } else {
        return {};
      }
    }
    isReservedWord(e) {
      return [
        "meta",
        "it",
        "result",
        "locals",
        "event",
        "target",
        "detail",
        "sender",
        "body",
      ].includes(e);
    }
    isHyperscriptContext(e) {
      return e instanceof f;
    }
    resolveSymbol(t, r, n) {
      if (t === "me" || t === "my" || t === "I") {
        return r.me;
      }
      if (t === "it" || t === "its" || t === "result") {
        return r.result;
      }
      if (t === "you" || t === "your" || t === "yourself") {
        return r.you;
      } else {
        if (n === "global") {
          return e[t];
        } else if (n === "element") {
          var i = this.getElementScope(r);
          return i[t];
        } else if (n === "local") {
          return r.locals[t];
        } else {
          if (r.meta && r.meta.context) {
            var a = r.meta.context[t];
            if (typeof a !== "undefined") {
              return a;
            }
            if (r.meta.context.detail) {
              a = r.meta.context.detail[t];
              if (typeof a !== "undefined") {
                return a;
              }
            }
          }
          if (this.isHyperscriptContext(r) && !this.isReservedWord(t)) {
            var o = r.locals[t];
          } else {
            var o = r[t];
          }
          if (typeof o !== "undefined") {
            return o;
          } else {
            var i = this.getElementScope(r);
            o = i[t];
            if (typeof o !== "undefined") {
              return o;
            } else {
              return e[t];
            }
          }
        }
      }
    }
    setSymbol(t, r, n, i) {
      if (n === "global") {
        e[t] = i;
      } else if (n === "element") {
        var a = this.getElementScope(r);
        a[t] = i;
      } else if (n === "local") {
        r.locals[t] = i;
      } else {
        if (
          this.isHyperscriptContext(r) &&
          !this.isReservedWord(t) &&
          typeof r.locals[t] !== "undefined"
        ) {
          r.locals[t] = i;
        } else {
          var a = this.getElementScope(r);
          var o = a[t];
          if (typeof o !== "undefined") {
            a[t] = i;
          } else {
            if (this.isHyperscriptContext(r) && !this.isReservedWord(t)) {
              r.locals[t] = i;
            } else {
              r[t] = i;
            }
          }
        }
      }
    }
    findNext(e, t) {
      if (e) {
        if (e.resolveNext) {
          return e.resolveNext(t);
        } else if (e.next) {
          return e.next;
        } else {
          return this.findNext(e.parent, t);
        }
      }
    }
    flatGet(e, t, r) {
      if (e != null) {
        var n = r(e, t);
        if (typeof n !== "undefined") {
          return n;
        }
        if (this.shouldAutoIterate(e)) {
          var i = [];
          for (var a of e) {
            var o = r(a, t);
            i.push(o);
          }
          return i;
        }
      }
    }
    resolveProperty(e, t) {
      return this.flatGet(e, t, (e, t) => e[t]);
    }
    resolveAttribute(e, t) {
      return this.flatGet(e, t, (e, t) => e.getAttribute && e.getAttribute(t));
    }
    resolveStyle(e, t) {
      return this.flatGet(e, t, (e, t) => e.style && e.style[t]);
    }
    resolveComputedStyle(e, t) {
      return this.flatGet(e, t, (e, t) =>
        getComputedStyle(e).getPropertyValue(t)
      );
    }
    assignToNamespace(t, r, n, i) {
      let a;
      if (typeof document !== "undefined" && t === document.body) {
        a = e;
      } else {
        a = this.getHyperscriptFeatures(t);
      }
      var o;
      while ((o = r.shift()) !== undefined) {
        var s = a[o];
        if (s == null) {
          s = {};
          a[o] = s;
        }
        a = s;
      }
      a[n] = i;
    }
    getHyperTrace(e, t) {
      var r = [];
      var n = e;
      while (n.meta.caller) {
        n = n.meta.caller;
      }
      if (n.meta.traceMap) {
        return n.meta.traceMap.get(t, r);
      }
    }
    registerHyperTrace(e, t) {
      var r = [];
      var n = null;
      while (e != null) {
        r.push(e);
        n = e;
        e = e.meta.caller;
      }
      if (n.meta.traceMap == null) {
        n.meta.traceMap = new Map();
      }
      if (!n.meta.traceMap.get(t)) {
        var i = {
          trace: r,
          print: function (e) {
            e = e || console.error;
            e("hypertrace /// ");
            var t = 0;
            for (var n = 0; n < r.length; n++) {
              t = Math.max(t, r[n].meta.feature.displayName.length);
            }
            for (var n = 0; n < r.length; n++) {
              var i = r[n];
              e(
                "  ->",
                i.meta.feature.displayName.padEnd(t + 2),
                "-",
                i.meta.owner
              );
            }
          },
        };
        n.meta.traceMap.set(t, i);
      }
    }
    escapeSelector(e) {
      return e.replace(/:/g, function (e) {
        return "\\" + e;
      });
    }
    nullCheck(e, t) {
      if (e == null) {
        throw new Error("'" + t.sourceFor() + "' is null");
      }
    }
    isEmpty(e) {
      return e == undefined || e.length === 0;
    }
    doesExist(e) {
      if (e == null) {
        return false;
      }
      if (this.shouldAutoIterate(e)) {
        for (const t of e) {
          return true;
        }
        return false;
      }
      return true;
    }
    getRootNode(e) {
      if (e && e instanceof Node) {
        var t = e.getRootNode();
        if (t instanceof Document || t instanceof ShadowRoot) return t;
      }
      return document;
    }
    getEventQueueFor(e, t) {
      let r = this.getInternalData(e);
      var n = r.eventQueues;
      if (n == null) {
        n = new Map();
        r.eventQueues = n;
      }
      var i = n.get(t);
      if (i == null) {
        i = { queue: [], executing: false };
        n.set(t, i);
      }
      return i;
    }
    beepValueToConsole(e, t, r) {
      if (
        this.triggerEvent(e, "hyperscript:beep", {
          element: e,
          expression: t,
          value: r,
        })
      ) {
        var n;
        if (r) {
          if (r instanceof m) {
            n = "ElementCollection";
          } else if (r.constructor) {
            n = r.constructor.name;
          } else {
            n = "unknown";
          }
        } else {
          n = "object (null)";
        }
        var a = r;
        if (n === "String") {
          a = '"' + a + '"';
        } else if (r instanceof m) {
          a = Array.from(r);
        }
        console.log(
          "///_ BEEP! The expression (" +
            i.sourceFor.call(t).replace("beep! ", "") +
            ") evaluates to:",
          a,
          "of type " + n
        );
      }
    }
    hyperscriptUrl =
      "document" in e && document.currentScript
        ? document.currentScript.src
        : null;
  }
  function s() {
    let e = document.cookie.split("; ").map((e) => {
      let t = e.split("=");
      return { name: t[0], value: decodeURIComponent(t[1]) };
    });
    return e;
  }
  function u(e) {
    document.cookie = e + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  function l() {
    for (const e of s()) {
      u(e.name);
    }
  }
  const c = new Proxy(
    {},
    {
      get(e, t) {
        if (t === "then" || t === "asyncWrapper") {
          return null;
        } else if (t === "length") {
          return s().length;
        } else if (t === "clear") {
          return u;
        } else if (t === "clearAll") {
          return l;
        } else if (typeof t === "string") {
          if (!isNaN(t)) {
            return s()[parseInt(t)];
          } else {
            let e = document.cookie
              .split("; ")
              .find((e) => e.startsWith(t + "="))
              ?.split("=")[1];
            if (e) {
              return decodeURIComponent(e);
            }
          }
        } else if (t === Symbol.iterator) {
          return s()[t];
        }
      },
      set(e, t, r) {
        var n = null;
        if ("string" === typeof r) {
          n = encodeURIComponent(r);
          n += ";samesite=lax";
        } else {
          n = encodeURIComponent(r.value);
          if (r.expires) {
            n += ";expires=" + r.maxAge;
          }
          if (r.maxAge) {
            n += ";max-age=" + r.maxAge;
          }
          if (r.partitioned) {
            n += ";partitioned=" + r.partitioned;
          }
          if (r.path) {
            n += ";path=" + r.path;
          }
          if (r.samesite) {
            n += ";samesite=" + r.path;
          }
          if (r.secure) {
            n += ";secure=" + r.path;
          }
        }
        document.cookie = t + "=" + n;
        return true;
      },
    }
  );
  class f {
    constructor(t, r, n, i, a) {
      this.meta = {
        parser: a.parser,
        lexer: a.lexer,
        runtime: a,
        owner: t,
        feature: r,
        iterators: {},
        ctx: this,
      };
      this.locals = { cookies: c };
      (this.me = n), (this.you = undefined);
      this.result = undefined;
      this.event = i;
      this.target = i ? i.target : null;
      this.detail = i ? i.detail : null;
      this.sender = i ? (i.detail ? i.detail.sender : null) : null;
      this.body = "document" in e ? document.body : null;
      a.addFeatures(t, this);
    }
  }
  class m {
    constructor(e, t, r) {
      this._css = e;
      this.relativeToElement = t;
      this.escape = r;
      this[p] = true;
    }
    get css() {
      if (this.escape) {
        return o.prototype.escapeSelector(this._css);
      } else {
        return this._css;
      }
    }
    get className() {
      return this._css.substr(1);
    }
    get id() {
      return this.className();
    }
    contains(e) {
      for (let t of this) {
        if (t.contains(e)) {
          return true;
        }
      }
      return false;
    }
    get length() {
      return this.selectMatches().length;
    }
    [Symbol.iterator]() {
      let e = this.selectMatches();
      return e[Symbol.iterator]();
    }
    selectMatches() {
      let e = o.prototype
        .getRootNode(this.relativeToElement)
        .querySelectorAll(this.css);
      return e;
    }
  }
  const p = Symbol();
  function h(e, t) {
    var r = e[t];
    if (r) {
      return r;
    } else {
      var n = {};
      e[t] = n;
      return n;
    }
  }
  function v(e) {
    try {
      return JSON.parse(e);
    } catch (e) {
      d(e);
      return null;
    }
  }
  function d(e) {
    if (console.error) {
      console.error(e);
    } else if (console.log) {
      console.log("ERROR: ", e);
    }
  }
  function E(e, t) {
    return new (e.bind.apply(e, [e].concat(t)))();
  }
  function T(t) {
    t.addLeafExpression("parenthesized", function (e, t, r) {
      if (r.matchOpToken("(")) {
        var n = r.clearFollows();
        try {
          var i = e.requireElement("expression", r);
        } finally {
          r.restoreFollows(n);
        }
        r.requireOpToken(")");
        return i;
      }
    });
    t.addLeafExpression("string", function (e, t, r) {
      var i = r.matchTokenType("STRING");
      if (!i) return;
      var a = i.value;
      var o;
      if (i.template) {
        var s = n.tokenize(a, true);
        o = e.parseStringTemplate(s);
      } else {
        o = [];
      }
      return {
        type: "string",
        token: i,
        args: o,
        op: function (e) {
          var t = "";
          for (var r = 1; r < arguments.length; r++) {
            var n = arguments[r];
            if (n !== undefined) {
              t += n;
            }
          }
          return t;
        },
        evaluate: function (e) {
          if (o.length === 0) {
            return a;
          } else {
            return t.unifiedEval(this, e);
          }
        },
      };
    });
    t.addGrammarElement("nakedString", function (e, t, r) {
      if (r.hasMore()) {
        var n = r.consumeUntilWhitespace();
        r.matchTokenType("WHITESPACE");
        return {
          type: "nakedString",
          tokens: n,
          evaluate: function (e) {
            return n
              .map(function (e) {
                return e.value;
              })
              .join("");
          },
        };
      }
    });
    t.addLeafExpression("number", function (e, t, r) {
      var n = r.matchTokenType("NUMBER");
      if (!n) return;
      var i = n;
      var a = parseFloat(n.value);
      return {
        type: "number",
        value: a,
        numberToken: i,
        evaluate: function () {
          return a;
        },
      };
    });
    t.addLeafExpression("idRef", function (e, t, r) {
      var i = r.matchTokenType("ID_REF");
      if (!i) return;
      if (!i.value) return;
      if (i.template) {
        var a = i.value.substring(2);
        var o = n.tokenize(a);
        var s = e.requireElement("expression", o);
        return {
          type: "idRefTemplate",
          args: [s],
          op: function (e, r) {
            return t.getRootNode(e.me).getElementById(r);
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        const e = i.value.substring(1);
        return {
          type: "idRef",
          css: i.value,
          value: e,
          evaluate: function (r) {
            return t.getRootNode(r.me).getElementById(e);
          },
        };
      }
    });
    t.addLeafExpression("classRef", function (e, t, r) {
      var i = r.matchTokenType("CLASS_REF");
      if (!i) return;
      if (!i.value) return;
      if (i.template) {
        var a = i.value.substring(2);
        var o = n.tokenize(a);
        var s = e.requireElement("expression", o);
        return {
          type: "classRefTemplate",
          args: [s],
          op: function (e, t) {
            return new m("." + t, e.me, true);
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        const e = i.value;
        return {
          type: "classRef",
          css: e,
          evaluate: function (t) {
            return new m(e, t.me, true);
          },
        };
      }
    });
    class r extends m {
      constructor(e, t, r) {
        super(e, t);
        this.templateParts = r;
        this.elements = r.filter((e) => e instanceof Element);
      }
      get css() {
        let e = "",
          t = 0;
        for (const r of this.templateParts) {
          if (r instanceof Element) {
            e += "[data-hs-query-id='" + t++ + "']";
          } else e += r;
        }
        return e;
      }
      [Symbol.iterator]() {
        this.elements.forEach((e, t) => (e.dataset.hsQueryId = t));
        const e = super[Symbol.iterator]();
        this.elements.forEach((e) => e.removeAttribute("data-hs-query-id"));
        return e;
      }
    }
    t.addLeafExpression("queryRef", function (e, t, i) {
      var a = i.matchOpToken("<");
      if (!a) return;
      var o = i.consumeUntil("/");
      i.requireOpToken("/");
      i.requireOpToken(">");
      var s = o
        .map(function (e) {
          if (e.type === "STRING") {
            return '"' + e.value + '"';
          } else {
            return e.value;
          }
        })
        .join("");
      var u, l, c;
      if (s.indexOf("$") >= 0) {
        u = true;
        l = n.tokenize(s, true);
        c = e.parseStringTemplate(l);
      }
      return {
        type: "queryRef",
        css: s,
        args: c,
        op: function (e, ...t) {
          if (u) {
            return new r(s, e.me, t);
          } else {
            return new m(s, e.me);
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addLeafExpression("attributeRef", function (e, t, r) {
      var n = r.matchTokenType("ATTRIBUTE_REF");
      if (!n) return;
      if (!n.value) return;
      var i = n.value;
      if (i.indexOf("[") === 0) {
        var a = i.substring(2, i.length - 1);
      } else {
        var a = i.substring(1);
      }
      var o = "[" + a + "]";
      var s = a.split("=");
      var u = s[0];
      var l = s[1];
      if (l) {
        if (l.indexOf('"') === 0) {
          l = l.substring(1, l.length - 1);
        }
      }
      return {
        type: "attributeRef",
        name: u,
        css: o,
        value: l,
        op: function (e) {
          var t = e.you || e.me;
          if (t) {
            return t.getAttribute(u);
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addLeafExpression("styleRef", function (e, t, r) {
      var n = r.matchTokenType("STYLE_REF");
      if (!n) return;
      if (!n.value) return;
      var i = n.value.substr(1);
      if (i.startsWith("computed-")) {
        i = i.substr("computed-".length);
        return {
          type: "computedStyleRef",
          name: i,
          op: function (e) {
            var r = e.you || e.me;
            if (r) {
              return t.resolveComputedStyle(r, i);
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        return {
          type: "styleRef",
          name: i,
          op: function (e) {
            var r = e.you || e.me;
            if (r) {
              return t.resolveStyle(r, i);
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      }
    });
    t.addGrammarElement("objectKey", function (e, t, r) {
      var n;
      if ((n = r.matchTokenType("STRING"))) {
        return {
          type: "objectKey",
          key: n.value,
          evaluate: function () {
            return n.value;
          },
        };
      } else if (r.matchOpToken("[")) {
        var i = e.parseElement("expression", r);
        r.requireOpToken("]");
        return {
          type: "objectKey",
          expr: i,
          args: [i],
          op: function (e, t) {
            return t;
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        var a = "";
        do {
          n = r.matchTokenType("IDENTIFIER") || r.matchOpToken("-");
          if (n) a += n.value;
        } while (n);
        return {
          type: "objectKey",
          key: a,
          evaluate: function () {
            return a;
          },
        };
      }
    });
    t.addLeafExpression("objectLiteral", function (e, t, r) {
      if (!r.matchOpToken("{")) return;
      var n = [];
      var i = [];
      if (!r.matchOpToken("}")) {
        do {
          var a = e.requireElement("objectKey", r);
          r.requireOpToken(":");
          var o = e.requireElement("expression", r);
          i.push(o);
          n.push(a);
        } while (r.matchOpToken(","));
        r.requireOpToken("}");
      }
      return {
        type: "objectLiteral",
        args: [n, i],
        op: function (e, t, r) {
          var n = {};
          for (var i = 0; i < t.length; i++) {
            n[t[i]] = r[i];
          }
          return n;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("nakedNamedArgumentList", function (e, t, r) {
      var n = [];
      var i = [];
      if (r.currentToken().type === "IDENTIFIER") {
        do {
          var a = r.requireTokenType("IDENTIFIER");
          r.requireOpToken(":");
          var o = e.requireElement("expression", r);
          i.push(o);
          n.push({ name: a, value: o });
        } while (r.matchOpToken(","));
      }
      return {
        type: "namedArgumentList",
        fields: n,
        args: [i],
        op: function (e, t) {
          var r = { _namedArgList_: true };
          for (var i = 0; i < t.length; i++) {
            var a = n[i];
            r[a.name.value] = t[i];
          }
          return r;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("namedArgumentList", function (e, t, r) {
      if (!r.matchOpToken("(")) return;
      var n = e.requireElement("nakedNamedArgumentList", r);
      r.requireOpToken(")");
      return n;
    });
    t.addGrammarElement("symbol", function (e, t, r) {
      var n = "default";
      if (r.matchToken("global")) {
        n = "global";
      } else if (r.matchToken("element") || r.matchToken("module")) {
        n = "element";
        if (r.matchOpToken("'")) {
          r.requireToken("s");
        }
      } else if (r.matchToken("local")) {
        n = "local";
      }
      let i = r.matchOpToken(":");
      let a = r.matchTokenType("IDENTIFIER");
      if (a && a.value) {
        var o = a.value;
        if (i) {
          o = ":" + o;
        }
        if (n === "default") {
          if (o.indexOf("$") === 0) {
            n = "global";
          }
          if (o.indexOf(":") === 0) {
            n = "element";
          }
        }
        return {
          type: "symbol",
          token: a,
          scope: n,
          name: o,
          evaluate: function (e) {
            return t.resolveSymbol(o, e, n);
          },
        };
      }
    });
    t.addGrammarElement("implicitMeTarget", function (e, t, r) {
      return {
        type: "implicitMeTarget",
        evaluate: function (e) {
          return e.you || e.me;
        },
      };
    });
    t.addLeafExpression("boolean", function (e, t, r) {
      var n = r.matchToken("true") || r.matchToken("false");
      if (!n) return;
      const i = n.value === "true";
      return {
        type: "boolean",
        evaluate: function (e) {
          return i;
        },
      };
    });
    t.addLeafExpression("null", function (e, t, r) {
      if (r.matchToken("null")) {
        return {
          type: "null",
          evaluate: function (e) {
            return null;
          },
        };
      }
    });
    t.addLeafExpression("arrayLiteral", function (e, t, r) {
      if (!r.matchOpToken("[")) return;
      var n = [];
      if (!r.matchOpToken("]")) {
        do {
          var i = e.requireElement("expression", r);
          n.push(i);
        } while (r.matchOpToken(","));
        r.requireOpToken("]");
      }
      return {
        type: "arrayLiteral",
        values: n,
        args: [n],
        op: function (e, t) {
          return t;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addLeafExpression("blockLiteral", function (e, t, r) {
      if (!r.matchOpToken("\\")) return;
      var n = [];
      var i = r.matchTokenType("IDENTIFIER");
      if (i) {
        n.push(i);
        while (r.matchOpToken(",")) {
          n.push(r.requireTokenType("IDENTIFIER"));
        }
      }
      r.requireOpToken("-");
      r.requireOpToken(">");
      var a = e.requireElement("expression", r);
      return {
        type: "blockLiteral",
        args: n,
        expr: a,
        evaluate: function (e) {
          var t = function () {
            for (var t = 0; t < n.length; t++) {
              e.locals[n[t].value] = arguments[t];
            }
            return a.evaluate(e);
          };
          return t;
        },
      };
    });
    t.addIndirectExpression("propertyAccess", function (e, t, r, n) {
      if (!r.matchOpToken(".")) return;
      var i = r.requireTokenType("IDENTIFIER");
      var a = {
        type: "propertyAccess",
        root: n,
        prop: i,
        args: [n],
        op: function (e, r) {
          var n = t.resolveProperty(r, i.value);
          return n;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return e.parseElement("indirectExpression", r, a);
    });
    t.addIndirectExpression("of", function (e, t, r, n) {
      if (!r.matchToken("of")) return;
      var i = e.requireElement("unaryExpression", r);
      var a = null;
      var o = n;
      while (o.root) {
        a = o;
        o = o.root;
      }
      if (
        o.type !== "symbol" &&
        o.type !== "attributeRef" &&
        o.type !== "styleRef" &&
        o.type !== "computedStyleRef"
      ) {
        e.raiseParseError(
          r,
          "Cannot take a property of a non-symbol: " + o.type
        );
      }
      var s = o.type === "attributeRef";
      var u = o.type === "styleRef" || o.type === "computedStyleRef";
      if (s || u) {
        var l = o;
      }
      var c = o.name;
      var f = {
        type: "ofExpression",
        prop: o.token,
        root: i,
        attribute: l,
        expression: n,
        args: [i],
        op: function (e, r) {
          if (s) {
            return t.resolveAttribute(r, c);
          } else if (u) {
            if (o.type === "computedStyleRef") {
              return t.resolveComputedStyle(r, c);
            } else {
              return t.resolveStyle(r, c);
            }
          } else {
            return t.resolveProperty(r, c);
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      if (o.type === "attributeRef") {
        f.attribute = o;
      }
      if (a) {
        a.root = f;
        a.args = [f];
      } else {
        n = f;
      }
      return e.parseElement("indirectExpression", r, n);
    });
    t.addIndirectExpression("possessive", function (e, t, r, n) {
      if (e.possessivesDisabled) {
        return;
      }
      var i = r.matchOpToken("'");
      if (
        i ||
        (n.type === "symbol" &&
          (n.name === "my" || n.name === "its" || n.name === "your") &&
          (r.currentToken().type === "IDENTIFIER" ||
            r.currentToken().type === "ATTRIBUTE_REF" ||
            r.currentToken().type === "STYLE_REF"))
      ) {
        if (i) {
          r.requireToken("s");
        }
        var a, o, s;
        a = e.parseElement("attributeRef", r);
        if (a == null) {
          o = e.parseElement("styleRef", r);
          if (o == null) {
            s = r.requireTokenType("IDENTIFIER");
          }
        }
        var u = {
          type: "possessive",
          root: n,
          attribute: a || o,
          prop: s,
          args: [n],
          op: function (e, r) {
            if (a) {
              var n = t.resolveAttribute(r, a.name);
            } else if (o) {
              var n;
              if (o.type === "computedStyleRef") {
                n = t.resolveComputedStyle(r, o["name"]);
              } else {
                n = t.resolveStyle(r, o["name"]);
              }
            } else {
              var n = t.resolveProperty(r, s.value);
            }
            return n;
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
        return e.parseElement("indirectExpression", r, u);
      }
    });
    t.addIndirectExpression("inExpression", function (e, t, r, n) {
      if (!r.matchToken("in")) return;
      var i = e.requireElement("unaryExpression", r);
      var a = {
        type: "inExpression",
        root: n,
        args: [n, i],
        op: function (e, r, n) {
          var i = [];
          if (r.css) {
            t.implicitLoop(n, function (e) {
              var t = e.querySelectorAll(r.css);
              for (var n = 0; n < t.length; n++) {
                i.push(t[n]);
              }
            });
          } else if (r instanceof Element) {
            var a = false;
            t.implicitLoop(n, function (e) {
              if (e.contains(r)) {
                a = true;
              }
            });
            if (a) {
              return r;
            }
          } else {
            t.implicitLoop(r, function (e) {
              t.implicitLoop(n, function (t) {
                if (e === t) {
                  i.push(e);
                }
              });
            });
          }
          return i;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return e.parseElement("indirectExpression", r, a);
    });
    t.addIndirectExpression("asExpression", function (e, t, r, n) {
      if (!r.matchToken("as")) return;
      r.matchToken("a") || r.matchToken("an");
      var i = e.requireElement("dotOrColonPath", r).evaluate();
      var a = {
        type: "asExpression",
        root: n,
        args: [n],
        op: function (e, r) {
          return t.convertValue(r, i);
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return e.parseElement("indirectExpression", r, a);
    });
    t.addIndirectExpression("functionCall", function (e, t, r, n) {
      if (!r.matchOpToken("(")) return;
      var i = [];
      if (!r.matchOpToken(")")) {
        do {
          i.push(e.requireElement("expression", r));
        } while (r.matchOpToken(","));
        r.requireOpToken(")");
      }
      if (n.root) {
        var a = {
          type: "functionCall",
          root: n,
          argExressions: i,
          args: [n.root, i],
          op: function (e, r, i) {
            t.nullCheck(r, n.root);
            var a = r[n.prop.value];
            t.nullCheck(a, n);
            if (a.hyperfunc) {
              i.push(e);
            }
            return a.apply(r, i);
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        var a = {
          type: "functionCall",
          root: n,
          argExressions: i,
          args: [n, i],
          op: function (e, r, i) {
            t.nullCheck(r, n);
            if (r.hyperfunc) {
              i.push(e);
            }
            var a = r.apply(null, i);
            return a;
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      }
      return e.parseElement("indirectExpression", r, a);
    });
    t.addIndirectExpression("attributeRefAccess", function (e, t, r, n) {
      var i = e.parseElement("attributeRef", r);
      if (!i) return;
      var a = {
        type: "attributeRefAccess",
        root: n,
        attribute: i,
        args: [n],
        op: function (e, r) {
          var n = t.resolveAttribute(r, i.name);
          return n;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return a;
    });
    t.addIndirectExpression("arrayIndex", function (e, t, r, n) {
      if (!r.matchOpToken("[")) return;
      var i = false;
      var a = false;
      var o = null;
      var s = null;
      if (r.matchOpToken("..")) {
        i = true;
        o = e.requireElement("expression", r);
      } else {
        o = e.requireElement("expression", r);
        if (r.matchOpToken("..")) {
          a = true;
          var u = r.currentToken();
          if (u.type !== "R_BRACKET") {
            s = e.parseElement("expression", r);
          }
        }
      }
      r.requireOpToken("]");
      var l = {
        type: "arrayIndex",
        root: n,
        prop: o,
        firstIndex: o,
        secondIndex: s,
        args: [n, o, s],
        op: function (e, t, r, n) {
          if (t == null) {
            return null;
          }
          if (i) {
            if (r < 0) {
              r = t.length + r;
            }
            return t.slice(0, r + 1);
          } else if (a) {
            if (n != null) {
              if (n < 0) {
                n = t.length + n;
              }
              return t.slice(r, n + 1);
            } else {
              return t.slice(r);
            }
          } else {
            return t[r];
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return e.parseElement("indirectExpression", r, l);
    });
    var a = [
      "em",
      "ex",
      "cap",
      "ch",
      "ic",
      "rem",
      "lh",
      "rlh",
      "vw",
      "vh",
      "vi",
      "vb",
      "vmin",
      "vmax",
      "cm",
      "mm",
      "Q",
      "pc",
      "pt",
      "px",
    ];
    t.addGrammarElement("postfixExpression", function (e, t, r) {
      var n = e.parseElement("primaryExpression", r);
      let i = r.matchAnyToken.apply(r, a) || r.matchOpToken("%");
      if (i) {
        return {
          type: "stringPostfix",
          postfix: i.value,
          args: [n],
          op: function (e, t) {
            return "" + t + i.value;
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      }
      var o = null;
      if (r.matchToken("s") || r.matchToken("seconds")) {
        o = 1e3;
      } else if (r.matchToken("ms") || r.matchToken("milliseconds")) {
        o = 1;
      }
      if (o) {
        return {
          type: "timeExpression",
          time: n,
          factor: o,
          args: [n],
          op: function (e, t) {
            return t * o;
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      }
      if (r.matchOpToken(":")) {
        var s = r.requireTokenType("IDENTIFIER");
        if (!s.value) return;
        var u = !r.matchOpToken("!");
        return {
          type: "typeCheck",
          typeName: s,
          nullOk: u,
          args: [n],
          op: function (e, r) {
            var n = t.typeCheck(r, this.typeName.value, u);
            if (n) {
              return r;
            } else {
              throw new Error("Typecheck failed!  Expected: " + s.value);
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      } else {
        return n;
      }
    });
    t.addGrammarElement("logicalNot", function (e, t, r) {
      if (!r.matchToken("not")) return;
      var n = e.requireElement("unaryExpression", r);
      return {
        type: "logicalNot",
        root: n,
        args: [n],
        op: function (e, t) {
          return !t;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("noExpression", function (e, t, r) {
      if (!r.matchToken("no")) return;
      var n = e.requireElement("unaryExpression", r);
      return {
        type: "noExpression",
        root: n,
        args: [n],
        op: function (e, r) {
          return t.isEmpty(r);
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addLeafExpression("some", function (e, t, r) {
      if (!r.matchToken("some")) return;
      var n = e.requireElement("expression", r);
      return {
        type: "noExpression",
        root: n,
        args: [n],
        op: function (e, r) {
          return !t.isEmpty(r);
        },
        evaluate(e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("negativeNumber", function (e, t, r) {
      if (!r.matchOpToken("-")) return;
      var n = e.requireElement("unaryExpression", r);
      return {
        type: "negativeNumber",
        root: n,
        args: [n],
        op: function (e, t) {
          return -1 * t;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("unaryExpression", function (e, t, r) {
      r.matchToken("the");
      return e.parseAnyOf(
        [
          "beepExpression",
          "logicalNot",
          "relativePositionalExpression",
          "positionalExpression",
          "noExpression",
          "negativeNumber",
          "postfixExpression",
        ],
        r
      );
    });
    t.addGrammarElement("beepExpression", function (e, t, r) {
      if (!r.matchToken("beep!")) return;
      var n = e.parseElement("unaryExpression", r);
      if (n) {
        n["booped"] = true;
        var i = n.evaluate;
        n.evaluate = function (e) {
          let r = i.apply(n, arguments);
          let a = e.me;
          t.beepValueToConsole(a, n, r);
          return r;
        };
        return n;
      }
    });
    var s = function (e, t, r, n) {
      var i = t.querySelectorAll(r);
      for (var a = 0; a < i.length; a++) {
        var o = i[a];
        if (o.compareDocumentPosition(e) === Node.DOCUMENT_POSITION_PRECEDING) {
          return o;
        }
      }
      if (n) {
        return i[0];
      }
    };
    var u = function (e, t, r, n) {
      var i = t.querySelectorAll(r);
      for (var a = i.length - 1; a >= 0; a--) {
        var o = i[a];
        if (o.compareDocumentPosition(e) === Node.DOCUMENT_POSITION_FOLLOWING) {
          return o;
        }
      }
      if (n) {
        return i[i.length - 1];
      }
    };
    var l = function (e, t, r, n) {
      var i = [];
      o.prototype.forEach(t, function (t) {
        if (t.matches(r) || t === e) {
          i.push(t);
        }
      });
      for (var a = 0; a < i.length - 1; a++) {
        var s = i[a];
        if (s === e) {
          return i[a + 1];
        }
      }
      if (n) {
        var u = i[0];
        if (u && u.matches(r)) {
          return u;
        }
      }
    };
    var c = function (e, t, r, n) {
      return l(e, Array.from(t).reverse(), r, n);
    };
    t.addGrammarElement("relativePositionalExpression", function (e, t, r) {
      var n = r.matchAnyToken("next", "previous");
      if (!n) return;
      var a = n.value === "next";
      var o = e.parseElement("expression", r);
      if (r.matchToken("from")) {
        r.pushFollow("in");
        try {
          var f = e.requireElement("unaryExpression", r);
        } finally {
          r.popFollow();
        }
      } else {
        var f = e.requireElement("implicitMeTarget", r);
      }
      var m = false;
      var p;
      if (r.matchToken("in")) {
        m = true;
        var h = e.requireElement("unaryExpression", r);
      } else if (r.matchToken("within")) {
        p = e.requireElement("unaryExpression", r);
      } else {
        p = document.body;
      }
      var v = false;
      if (r.matchToken("with")) {
        r.requireToken("wrapping");
        v = true;
      }
      return {
        type: "relativePositionalExpression",
        from: f,
        forwardSearch: a,
        inSearch: m,
        wrapping: v,
        inElt: h,
        withinElt: p,
        operator: n.value,
        args: [o, f, h, p],
        op: function (e, t, r, n, f) {
          var p = t.css;
          if (p == null) {
            throw (
              "Expected a CSS value to be returned by " + i.sourceFor.apply(o)
            );
          }
          if (m) {
            if (n) {
              if (a) {
                return l(r, n, p, v);
              } else {
                return c(r, n, p, v);
              }
            }
          } else {
            if (f) {
              if (a) {
                return s(r, f, p, v);
              } else {
                return u(r, f, p, v);
              }
            }
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("positionalExpression", function (e, t, r) {
      var n = r.matchAnyToken("first", "last", "random");
      if (!n) return;
      r.matchAnyToken("in", "from", "of");
      var i = e.requireElement("unaryExpression", r);
      const a = n.value;
      return {
        type: "positionalExpression",
        rhs: i,
        operator: n.value,
        args: [i],
        op: function (e, t) {
          if (t && !Array.isArray(t)) {
            if (t.children) {
              t = t.children;
            } else {
              t = Array.from(t);
            }
          }
          if (t) {
            if (a === "first") {
              return t[0];
            } else if (a === "last") {
              return t[t.length - 1];
            } else if (a === "random") {
              return t[Math.floor(Math.random() * t.length)];
            }
          }
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    t.addGrammarElement("mathOperator", function (e, t, r) {
      var n = e.parseElement("unaryExpression", r);
      var i,
        a = null;
      i = r.matchAnyOpToken("+", "-", "*", "/") || r.matchToken("mod");
      while (i) {
        a = a || i;
        var o = i.value;
        if (a.value !== o) {
          e.raiseParseError(
            r,
            "You must parenthesize math operations with different operators"
          );
        }
        var s = e.parseElement("unaryExpression", r);
        n = {
          type: "mathOperator",
          lhs: n,
          rhs: s,
          operator: o,
          args: [n, s],
          op: function (e, t, r) {
            if (o === "+") {
              return t + r;
            } else if (o === "-") {
              return t - r;
            } else if (o === "*") {
              return t * r;
            } else if (o === "/") {
              return t / r;
            } else if (o === "mod") {
              return t % r;
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
        i = r.matchAnyOpToken("+", "-", "*", "/") || r.matchToken("mod");
      }
      return n;
    });
    t.addGrammarElement("mathExpression", function (e, t, r) {
      return e.parseAnyOf(["mathOperator", "unaryExpression"], r);
    });
    function f(e, t, r) {
      if (t["contains"]) {
        return t.contains(r);
      } else if (t["includes"]) {
        return t.includes(r);
      } else {
        throw Error(
          "The value of " +
            e.sourceFor() +
            " does not have a contains or includes method on it"
        );
      }
    }
    function p(e, t, r) {
      if (t["match"]) {
        return !!t.match(r);
      } else if (t["matches"]) {
        return t.matches(r);
      } else {
        throw Error(
          "The value of " +
            e.sourceFor() +
            " does not have a match or matches method on it"
        );
      }
    }
    t.addGrammarElement("comparisonOperator", function (e, t, r) {
      var n = e.parseElement("mathExpression", r);
      var i = r.matchAnyOpToken("<", ">", "<=", ">=", "==", "===", "!=", "!==");
      var a = i ? i.value : null;
      var o = true;
      var s = false;
      if (a == null) {
        if (r.matchToken("is") || r.matchToken("am")) {
          if (r.matchToken("not")) {
            if (r.matchToken("in")) {
              a = "not in";
            } else if (r.matchToken("a")) {
              a = "not a";
              s = true;
            } else if (r.matchToken("empty")) {
              a = "not empty";
              o = false;
            } else {
              if (r.matchToken("really")) {
                a = "!==";
              } else {
                a = "!=";
              }
              if (r.matchToken("equal")) {
                r.matchToken("to");
              }
            }
          } else if (r.matchToken("in")) {
            a = "in";
          } else if (r.matchToken("a")) {
            a = "a";
            s = true;
          } else if (r.matchToken("empty")) {
            a = "empty";
            o = false;
          } else if (r.matchToken("less")) {
            r.requireToken("than");
            if (r.matchToken("or")) {
              r.requireToken("equal");
              r.requireToken("to");
              a = "<=";
            } else {
              a = "<";
            }
          } else if (r.matchToken("greater")) {
            r.requireToken("than");
            if (r.matchToken("or")) {
              r.requireToken("equal");
              r.requireToken("to");
              a = ">=";
            } else {
              a = ">";
            }
          } else {
            if (r.matchToken("really")) {
              a = "===";
            } else {
              a = "==";
            }
            if (r.matchToken("equal")) {
              r.matchToken("to");
            }
          }
        } else if (r.matchToken("equals")) {
          a = "==";
        } else if (r.matchToken("really")) {
          r.requireToken("equals");
          a = "===";
        } else if (r.matchToken("exist") || r.matchToken("exists")) {
          a = "exist";
          o = false;
        } else if (r.matchToken("matches") || r.matchToken("match")) {
          a = "match";
        } else if (r.matchToken("contains") || r.matchToken("contain")) {
          a = "contain";
        } else if (r.matchToken("includes") || r.matchToken("include")) {
          a = "include";
        } else if (r.matchToken("do") || r.matchToken("does")) {
          r.requireToken("not");
          if (r.matchToken("matches") || r.matchToken("match")) {
            a = "not match";
          } else if (r.matchToken("contains") || r.matchToken("contain")) {
            a = "not contain";
          } else if (r.matchToken("exist") || r.matchToken("exist")) {
            a = "not exist";
            o = false;
          } else if (r.matchToken("include")) {
            a = "not include";
          } else {
            e.raiseParseError(r, "Expected matches or contains");
          }
        }
      }
      if (a) {
        var u, l, c;
        if (s) {
          u = r.requireTokenType("IDENTIFIER");
          l = !r.matchOpToken("!");
        } else if (o) {
          c = e.requireElement("mathExpression", r);
          if (a === "match" || a === "not match") {
            c = c.css ? c.css : c;
          }
        }
        var m = n;
        n = {
          type: "comparisonOperator",
          operator: a,
          typeName: u,
          nullOk: l,
          lhs: n,
          rhs: c,
          args: [n, c],
          op: function (e, r, n) {
            if (a === "==") {
              return r == n;
            } else if (a === "!=") {
              return r != n;
            }
            if (a === "===") {
              return r === n;
            } else if (a === "!==") {
              return r !== n;
            }
            if (a === "match") {
              return r != null && p(m, r, n);
            }
            if (a === "not match") {
              return r == null || !p(m, r, n);
            }
            if (a === "in") {
              return n != null && f(c, n, r);
            }
            if (a === "not in") {
              return n == null || !f(c, n, r);
            }
            if (a === "contain") {
              return r != null && f(m, r, n);
            }
            if (a === "not contain") {
              return r == null || !f(m, r, n);
            }
            if (a === "include") {
              return r != null && f(m, r, n);
            }
            if (a === "not include") {
              return r == null || !f(m, r, n);
            }
            if (a === "===") {
              return r === n;
            } else if (a === "!==") {
              return r !== n;
            } else if (a === "<") {
              return r < n;
            } else if (a === ">") {
              return r > n;
            } else if (a === "<=") {
              return r <= n;
            } else if (a === ">=") {
              return r >= n;
            } else if (a === "empty") {
              return t.isEmpty(r);
            } else if (a === "not empty") {
              return !t.isEmpty(r);
            } else if (a === "exist") {
              return t.doesExist(r);
            } else if (a === "not exist") {
              return !t.doesExist(r);
            } else if (a === "a") {
              return t.typeCheck(r, u.value, l);
            } else if (a === "not a") {
              return !t.typeCheck(r, u.value, l);
            } else {
              throw "Unknown comparison : " + a;
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
      }
      return n;
    });
    t.addGrammarElement("comparisonExpression", function (e, t, r) {
      return e.parseAnyOf(["comparisonOperator", "mathExpression"], r);
    });
    t.addGrammarElement("logicalOperator", function (e, t, r) {
      var n = e.parseElement("comparisonExpression", r);
      var i,
        a = null;
      i = r.matchToken("and") || r.matchToken("or");
      while (i) {
        a = a || i;
        if (a.value !== i.value) {
          e.raiseParseError(
            r,
            "You must parenthesize logical operations with different operators"
          );
        }
        var o = e.requireElement("comparisonExpression", r);
        const s = i.value;
        n = {
          type: "logicalOperator",
          operator: s,
          lhs: n,
          rhs: o,
          args: [n, o],
          op: function (e, t, r) {
            if (s === "and") {
              return t && r;
            } else {
              return t || r;
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
        i = r.matchToken("and") || r.matchToken("or");
      }
      return n;
    });
    t.addGrammarElement("logicalExpression", function (e, t, r) {
      return e.parseAnyOf(["logicalOperator", "mathExpression"], r);
    });
    t.addGrammarElement("asyncExpression", function (e, t, r) {
      if (r.matchToken("async")) {
        var n = e.requireElement("logicalExpression", r);
        var i = {
          type: "asyncExpression",
          value: n,
          evaluate: function (e) {
            return { asyncWrapper: true, value: this.value.evaluate(e) };
          },
        };
        return i;
      } else {
        return e.parseElement("logicalExpression", r);
      }
    });
    t.addGrammarElement("expression", function (e, t, r) {
      r.matchToken("the");
      return e.parseElement("asyncExpression", r);
    });
    t.addGrammarElement("assignableExpression", function (e, t, r) {
      r.matchToken("the");
      var n = e.parseElement("primaryExpression", r);
      if (
        n &&
        (n.type === "symbol" ||
          n.type === "ofExpression" ||
          n.type === "propertyAccess" ||
          n.type === "attributeRefAccess" ||
          n.type === "attributeRef" ||
          n.type === "styleRef" ||
          n.type === "arrayIndex" ||
          n.type === "possessive")
      ) {
        return n;
      } else {
        e.raiseParseError(
          r,
          "A target expression must be writable.  The expression type '" +
            (n && n.type) +
            "' is not."
        );
      }
      return n;
    });
    t.addGrammarElement("hyperscript", function (e, t, r) {
      var n = [];
      if (r.hasMore()) {
        while (
          e.featureStart(r.currentToken()) ||
          r.currentToken().value === "("
        ) {
          var i = e.requireElement("feature", r);
          n.push(i);
          r.matchToken("end");
        }
      }
      return {
        type: "hyperscript",
        features: n,
        apply: function (e, t, r) {
          for (const i of n) {
            i.install(e, t, r);
          }
        },
      };
    });
    var v = function (e) {
      var t = [];
      if (
        e.token(0).value === "(" &&
        (e.token(1).value === ")" ||
          e.token(2).value === "," ||
          e.token(2).value === ")")
      ) {
        e.matchOpToken("(");
        do {
          t.push(e.requireTokenType("IDENTIFIER"));
        } while (e.matchOpToken(","));
        e.requireOpToken(")");
      }
      return t;
    };
    t.addFeature("on", function (e, t, r) {
      if (!r.matchToken("on")) return;
      var n = false;
      if (r.matchToken("every")) {
        n = true;
      }
      var i = [];
      var a = null;
      do {
        var o = e.requireElement("eventName", r, "Expected event name");
        var s = o.evaluate();
        if (a) {
          a = a + " or " + s;
        } else {
          a = "on " + s;
        }
        var u = v(r);
        var l = null;
        if (r.matchOpToken("[")) {
          l = e.requireElement("expression", r);
          r.requireOpToken("]");
        }
        var c, f, m;
        if (r.currentToken().type === "NUMBER") {
          var p = r.consumeToken();
          if (!p.value) return;
          c = parseInt(p.value);
          if (r.matchToken("to")) {
            var h = r.consumeToken();
            if (!h.value) return;
            f = parseInt(h.value);
          } else if (r.matchToken("and")) {
            m = true;
            r.requireToken("on");
          }
        }
        var d, E;
        if (s === "intersection") {
          d = {};
          if (r.matchToken("with")) {
            d["with"] = e.requireElement("expression", r).evaluate();
          }
          if (r.matchToken("having")) {
            do {
              if (r.matchToken("margin")) {
                d["rootMargin"] = e.requireElement("stringLike", r).evaluate();
              } else if (r.matchToken("threshold")) {
                d["threshold"] = e.requireElement("expression", r).evaluate();
              } else {
                e.raiseParseError(
                  r,
                  "Unknown intersection config specification"
                );
              }
            } while (r.matchToken("and"));
          }
        } else if (s === "mutation") {
          E = {};
          if (r.matchToken("of")) {
            do {
              if (r.matchToken("anything")) {
                E["attributes"] = true;
                E["subtree"] = true;
                E["characterData"] = true;
                E["childList"] = true;
              } else if (r.matchToken("childList")) {
                E["childList"] = true;
              } else if (r.matchToken("attributes")) {
                E["attributes"] = true;
                E["attributeOldValue"] = true;
              } else if (r.matchToken("subtree")) {
                E["subtree"] = true;
              } else if (r.matchToken("characterData")) {
                E["characterData"] = true;
                E["characterDataOldValue"] = true;
              } else if (r.currentToken().type === "ATTRIBUTE_REF") {
                var T = r.consumeToken();
                if (E["attributeFilter"] == null) {
                  E["attributeFilter"] = [];
                }
                if (T.value.indexOf("@") == 0) {
                  E["attributeFilter"].push(T.value.substring(1));
                } else {
                  e.raiseParseError(
                    r,
                    "Only shorthand attribute references are allowed here"
                  );
                }
              } else {
                e.raiseParseError(r, "Unknown mutation config specification");
              }
            } while (r.matchToken("or"));
          } else {
            E["attributes"] = true;
            E["characterData"] = true;
            E["childList"] = true;
          }
        }
        var y = null;
        var k = false;
        if (r.matchToken("from")) {
          if (r.matchToken("elsewhere")) {
            k = true;
          } else {
            r.pushFollow("or");
            try {
              y = e.requireElement("expression", r);
            } finally {
              r.popFollow();
            }
            if (!y) {
              e.raiseParseError(
                r,
                'Expected either target value or "elsewhere".'
              );
            }
          }
        }
        if (y === null && k === false && r.matchToken("elsewhere")) {
          k = true;
        }
        if (r.matchToken("in")) {
          var x = e.parseElement("unaryExpression", r);
        }
        if (r.matchToken("debounced")) {
          r.requireToken("at");
          var g = e.requireElement("unaryExpression", r);
          var b = g.evaluate({});
        } else if (r.matchToken("throttled")) {
          r.requireToken("at");
          var g = e.requireElement("unaryExpression", r);
          var w = g.evaluate({});
        }
        i.push({
          execCount: 0,
          every: n,
          on: s,
          args: u,
          filter: l,
          from: y,
          inExpr: x,
          elsewhere: k,
          startCount: c,
          endCount: f,
          unbounded: m,
          debounceTime: b,
          throttleTime: w,
          mutationSpec: E,
          intersectionSpec: d,
          debounced: undefined,
          lastExec: undefined,
        });
      } while (r.matchToken("or"));
      var S = true;
      if (!n) {
        if (r.matchToken("queue")) {
          if (r.matchToken("all")) {
            var q = true;
            var S = false;
          } else if (r.matchToken("first")) {
            var N = true;
          } else if (r.matchToken("none")) {
            var I = true;
          } else {
            r.requireToken("last");
          }
        }
      }
      var C = e.requireElement("commandList", r);
      e.ensureTerminated(C);
      var R, A;
      if (r.matchToken("catch")) {
        R = r.requireTokenType("IDENTIFIER").value;
        A = e.requireElement("commandList", r);
        e.ensureTerminated(A);
      }
      if (r.matchToken("finally")) {
        var L = e.requireElement("commandList", r);
        e.ensureTerminated(L);
      }
      var O = {
        displayName: a,
        events: i,
        start: C,
        every: n,
        execCount: 0,
        errorHandler: A,
        errorSymbol: R,
        execute: function (e) {
          let r = t.getEventQueueFor(e.me, O);
          if (r.executing && n === false) {
            if (I || (N && r.queue.length > 0)) {
              return;
            }
            if (S) {
              r.queue.length = 0;
            }
            r.queue.push(e);
            return;
          }
          O.execCount++;
          r.executing = true;
          e.meta.onHalt = function () {
            r.executing = false;
            var e = r.queue.shift();
            if (e) {
              setTimeout(function () {
                O.execute(e);
              }, 1);
            }
          };
          e.meta.reject = function (r) {
            console.error(r.message ? r.message : r);
            var n = t.getHyperTrace(e, r);
            if (n) {
              n.print();
            }
            t.triggerEvent(e.me, "exception", { error: r });
          };
          C.execute(e);
        },
        install: function (e, r) {
          for (const r of O.events) {
            var n;
            if (r.elsewhere) {
              n = [document];
            } else if (r.from) {
              n = r.from.evaluate(t.makeContext(e, O, e, null));
            } else {
              n = [e];
            }
            t.implicitLoop(n, function (n) {
              var i = r.on;
              if (n == null) {
                console.warn(
                  "'%s' feature ignored because target does not exists:",
                  a,
                  e
                );
                return;
              }
              if (r.mutationSpec) {
                i = "hyperscript:mutation";
                const e = new MutationObserver(function (e, r) {
                  if (!O.executing) {
                    t.triggerEvent(n, i, { mutationList: e, observer: r });
                  }
                });
                e.observe(n, r.mutationSpec);
              }
              if (r.intersectionSpec) {
                i = "hyperscript:intersection";
                const e = new IntersectionObserver(function (r) {
                  for (const o of r) {
                    var a = { observer: e };
                    a = Object.assign(a, o);
                    a["intersecting"] = o.isIntersecting;
                    t.triggerEvent(n, i, a);
                  }
                }, r.intersectionSpec);
                e.observe(n);
              }
              var o = n.addEventListener || n.on;
              o.call(n, i, function a(o) {
                if (
                  typeof Node !== "undefined" &&
                  e instanceof Node &&
                  n !== e &&
                  !e.isConnected
                ) {
                  n.removeEventListener(i, a);
                  return;
                }
                var s = t.makeContext(e, O, e, o);
                if (r.elsewhere && e.contains(o.target)) {
                  return;
                }
                if (r.from) {
                  s.result = n;
                }
                for (const e of r.args) {
                  let t = s.event[e.value];
                  if (t !== undefined) {
                    s.locals[e.value] = t;
                  } else if ("detail" in s.event) {
                    s.locals[e.value] = s.event["detail"][e.value];
                  }
                }
                s.meta.errorHandler = A;
                s.meta.errorSymbol = R;
                s.meta.finallyHandler = L;
                if (r.filter) {
                  var u = s.meta.context;
                  s.meta.context = s.event;
                  try {
                    var l = r.filter.evaluate(s);
                    if (l) {
                    } else {
                      return;
                    }
                  } finally {
                    s.meta.context = u;
                  }
                }
                if (r.inExpr) {
                  var c = o.target;
                  while (true) {
                    if (c.matches && c.matches(r.inExpr.css)) {
                      s.result = c;
                      break;
                    } else {
                      c = c.parentElement;
                      if (c == null) {
                        return;
                      }
                    }
                  }
                }
                r.execCount++;
                if (r.startCount) {
                  if (r.endCount) {
                    if (
                      r.execCount < r.startCount ||
                      r.execCount > r.endCount
                    ) {
                      return;
                    }
                  } else if (r.unbounded) {
                    if (r.execCount < r.startCount) {
                      return;
                    }
                  } else if (r.execCount !== r.startCount) {
                    return;
                  }
                }
                if (r.debounceTime) {
                  if (r.debounced) {
                    clearTimeout(r.debounced);
                  }
                  r.debounced = setTimeout(function () {
                    O.execute(s);
                  }, r.debounceTime);
                  return;
                }
                if (r.throttleTime) {
                  if (r.lastExec && Date.now() < r.lastExec + r.throttleTime) {
                    return;
                  } else {
                    r.lastExec = Date.now();
                  }
                }
                O.execute(s);
              });
            });
          }
        },
      };
      e.setParent(C, O);
      return O;
    });
    t.addFeature("def", function (e, t, r) {
      if (!r.matchToken("def")) return;
      var n = e.requireElement("dotOrColonPath", r);
      var i = n.evaluate();
      var a = i.split(".");
      var o = a.pop();
      var s = [];
      if (r.matchOpToken("(")) {
        if (r.matchOpToken(")")) {
        } else {
          do {
            s.push(r.requireTokenType("IDENTIFIER"));
          } while (r.matchOpToken(","));
          r.requireOpToken(")");
        }
      }
      var u = e.requireElement("commandList", r);
      var l, c;
      if (r.matchToken("catch")) {
        l = r.requireTokenType("IDENTIFIER").value;
        c = e.parseElement("commandList", r);
      }
      if (r.matchToken("finally")) {
        var f = e.requireElement("commandList", r);
        e.ensureTerminated(f);
      }
      var m = {
        displayName:
          o +
          "(" +
          s
            .map(function (e) {
              return e.value;
            })
            .join(", ") +
          ")",
        name: o,
        args: s,
        start: u,
        errorHandler: c,
        errorSymbol: l,
        finallyHandler: f,
        install: function (e, r) {
          var n = function () {
            var n = t.makeContext(r, m, e, null);
            n.meta.errorHandler = c;
            n.meta.errorSymbol = l;
            n.meta.finallyHandler = f;
            for (var i = 0; i < s.length; i++) {
              var a = s[i];
              var o = arguments[i];
              if (a) {
                n.locals[a.value] = o;
              }
            }
            n.meta.caller = arguments[s.length];
            if (n.meta.caller) {
              n.meta.callingCommand = n.meta.caller.meta.command;
            }
            var p,
              h = null;
            var v = new Promise(function (e, t) {
              p = e;
              h = t;
            });
            u.execute(n);
            if (n.meta.returned) {
              return n.meta.returnValue;
            } else {
              n.meta.resolve = p;
              n.meta.reject = h;
              return v;
            }
          };
          n.hyperfunc = true;
          n.hypername = i;
          t.assignToNamespace(e, a, o, n);
        },
      };
      e.ensureTerminated(u);
      if (c) {
        e.ensureTerminated(c);
      }
      e.setParent(u, m);
      return m;
    });
    t.addFeature("set", function (e, t, r) {
      let n = e.parseElement("setCommand", r);
      if (n) {
        if (n.target.scope !== "element") {
          e.raiseParseError(
            r,
            "variables declared at the feature level must be element scoped."
          );
        }
        let i = {
          start: n,
          install: function (e, r) {
            n && n.execute(t.makeContext(e, i, e, null));
          },
        };
        e.ensureTerminated(n);
        return i;
      }
    });
    t.addFeature("init", function (e, t, r) {
      if (!r.matchToken("init")) return;
      var n = r.matchToken("immediately");
      var i = e.requireElement("commandList", r);
      var a = {
        start: i,
        install: function (e, r) {
          let o = function () {
            i && i.execute(t.makeContext(e, a, e, null));
          };
          if (n) {
            o();
          } else {
            setTimeout(o, 0);
          }
        },
      };
      e.ensureTerminated(i);
      e.setParent(i, a);
      return a;
    });
    t.addFeature("worker", function (e, t, r) {
      if (r.matchToken("worker")) {
        e.raiseParseError(
          r,
          "In order to use the 'worker' feature, include " +
            "the _hyperscript worker plugin. See " +
            "https://hyperscript.org/features/worker/ for " +
            "more info."
        );
        return undefined;
      }
    });
    t.addFeature("behavior", function (t, r, n) {
      if (!n.matchToken("behavior")) return;
      var i = t.requireElement("dotOrColonPath", n).evaluate();
      var a = i.split(".");
      var o = a.pop();
      var s = [];
      if (n.matchOpToken("(") && !n.matchOpToken(")")) {
        do {
          s.push(n.requireTokenType("IDENTIFIER").value);
        } while (n.matchOpToken(","));
        n.requireOpToken(")");
      }
      var u = t.requireElement("hyperscript", n);
      for (var l = 0; l < u.features.length; l++) {
        var c = u.features[l];
        c.behavior = i;
      }
      return {
        install: function (t, n) {
          r.assignToNamespace(
            e.document && e.document.body,
            a,
            o,
            function (e, t, n) {
              var a = r.getInternalData(e);
              var o = h(a, i + "Scope");
              for (var l = 0; l < s.length; l++) {
                o[s[l]] = n[s[l]];
              }
              u.apply(e, t);
            }
          );
        },
      };
    });
    t.addFeature("install", function (t, r, n) {
      if (!n.matchToken("install")) return;
      var i = t.requireElement("dotOrColonPath", n).evaluate();
      var a = i.split(".");
      var o = t.parseElement("namedArgumentList", n);
      var s;
      return (s = {
        install: function (t, n) {
          r.unifiedEval(
            {
              args: [o],
              op: function (r, o) {
                var s = e;
                for (var u = 0; u < a.length; u++) {
                  s = s[a[u]];
                  if (typeof s !== "object" && typeof s !== "function")
                    throw new Error("No such behavior defined as " + i);
                }
                if (!(s instanceof Function))
                  throw new Error(i + " is not a behavior");
                s(t, n, o);
              },
            },
            r.makeContext(t, s, t, null)
          );
        },
      });
    });
    t.addGrammarElement("jsBody", function (e, t, r) {
      var n = r.currentToken().start;
      var i = r.currentToken();
      var a = [];
      var o = "";
      var s = false;
      while (r.hasMore()) {
        i = r.consumeToken();
        var u = r.token(0, true);
        if (u.type === "IDENTIFIER" && u.value === "end") {
          break;
        }
        if (s) {
          if (i.type === "IDENTIFIER" || i.type === "NUMBER") {
            o += i.value;
          } else {
            if (o !== "") a.push(o);
            o = "";
            s = false;
          }
        } else if (i.type === "IDENTIFIER" && i.value === "function") {
          s = true;
        }
      }
      var l = i.end + 1;
      return {
        type: "jsBody",
        exposedFunctionNames: a,
        jsSource: r.source.substring(n, l),
      };
    });
    t.addFeature("js", function (t, r, n) {
      if (!n.matchToken("js")) return;
      var i = t.requireElement("jsBody", n);
      var a =
        i.jsSource +
        "\nreturn { " +
        i.exposedFunctionNames
          .map(function (e) {
            return e + ":" + e;
          })
          .join(",") +
        " } ";
      var o = new Function(a);
      return {
        jsSource: a,
        function: o,
        exposedFunctionNames: i.exposedFunctionNames,
        install: function () {
          Object.assign(e, o());
        },
      };
    });
    t.addCommand("js", function (t, r, n) {
      if (!n.matchToken("js")) return;
      var i = [];
      if (n.matchOpToken("(")) {
        if (n.matchOpToken(")")) {
        } else {
          do {
            var a = n.requireTokenType("IDENTIFIER");
            i.push(a.value);
          } while (n.matchOpToken(","));
          n.requireOpToken(")");
        }
      }
      var o = t.requireElement("jsBody", n);
      n.matchToken("end");
      var s = E(Function, i.concat([o.jsSource]));
      var u = {
        jsSource: o.jsSource,
        function: s,
        inputs: i,
        op: function (t) {
          var n = [];
          i.forEach(function (e) {
            n.push(r.resolveSymbol(e, t, "default"));
          });
          var a = s.apply(e, n);
          if (a && typeof a.then === "function") {
            return new Promise(function (e) {
              a.then(function (n) {
                t.result = n;
                e(r.findNext(this, t));
              });
            });
          } else {
            t.result = a;
            return r.findNext(this, t);
          }
        },
      };
      return u;
    });
    t.addCommand("async", function (e, t, r) {
      if (!r.matchToken("async")) return;
      if (r.matchToken("do")) {
        var n = e.requireElement("commandList", r);
        var i = n;
        while (i.next) i = i.next;
        i.next = t.HALT;
        r.requireToken("end");
      } else {
        var n = e.requireElement("command", r);
      }
      var a = {
        body: n,
        op: function (e) {
          setTimeout(function () {
            n.execute(e);
          });
          return t.findNext(this, e);
        },
      };
      e.setParent(n, a);
      return a;
    });
    t.addCommand("tell", function (e, t, r) {
      var n = r.currentToken();
      if (!r.matchToken("tell")) return;
      var i = e.requireElement("expression", r);
      var a = e.requireElement("commandList", r);
      if (r.hasMore() && !e.featureStart(r.currentToken())) {
        r.requireToken("end");
      }
      var o = "tell_" + n.start;
      var s = {
        value: i,
        body: a,
        args: [i],
        resolveNext: function (e) {
          var r = e.meta.iterators[o];
          if (r.index < r.value.length) {
            e.you = r.value[r.index++];
            return a;
          } else {
            e.you = r.originalYou;
            if (this.next) {
              return this.next;
            } else {
              return t.findNext(this.parent, e);
            }
          }
        },
        op: function (e, t) {
          if (t == null) {
            t = [];
          } else if (!(Array.isArray(t) || t instanceof NodeList)) {
            t = [t];
          }
          e.meta.iterators[o] = { originalYou: e.you, index: 0, value: t };
          return this.resolveNext(e);
        },
      };
      e.setParent(a, s);
      return s;
    });
    t.addCommand("wait", function (e, t, r) {
      if (!r.matchToken("wait")) return;
      var n;
      if (r.matchToken("for")) {
        r.matchToken("a");
        var i = [];
        do {
          var a = r.token(0);
          if (a.type === "NUMBER" || a.type === "L_PAREN") {
            i.push({ time: e.requireElement("expression", r).evaluate() });
          } else {
            i.push({
              name: e
                .requireElement("dotOrColonPath", r, "Expected event name")
                .evaluate(),
              args: v(r),
            });
          }
        } while (r.matchToken("or"));
        if (r.matchToken("from")) {
          var o = e.requireElement("expression", r);
        }
        n = {
          event: i,
          on: o,
          args: [o],
          op: function (e, r) {
            var n = r ? r : e.me;
            if (!(n instanceof EventTarget))
              throw new Error(
                "Not a valid event target: " + this.on.sourceFor()
              );
            return new Promise((r) => {
              var a = false;
              for (const s of i) {
                var o = (n) => {
                  e.result = n;
                  if (s.args) {
                    for (const t of s.args) {
                      e.locals[t.value] =
                        n[t.value] || (n.detail ? n.detail[t.value] : null);
                    }
                  }
                  if (!a) {
                    a = true;
                    r(t.findNext(this, e));
                  }
                };
                if (s.name) {
                  n.addEventListener(s.name, o, { once: true });
                } else if (s.time != null) {
                  setTimeout(o, s.time, s.time);
                }
              }
            });
          },
        };
        return n;
      } else {
        var s;
        if (r.matchToken("a")) {
          r.requireToken("tick");
          s = 0;
        } else {
          s = e.requireElement("expression", r);
        }
        n = {
          type: "waitCmd",
          time: s,
          args: [s],
          op: function (e, r) {
            return new Promise((n) => {
              setTimeout(() => {
                n(t.findNext(this, e));
              }, r);
            });
          },
          execute: function (e) {
            return t.unifiedExec(this, e);
          },
        };
        return n;
      }
    });
    t.addGrammarElement("dotOrColonPath", function (e, t, r) {
      var n = r.matchTokenType("IDENTIFIER");
      if (n) {
        var i = [n.value];
        var a = r.matchOpToken(".") || r.matchOpToken(":");
        if (a) {
          do {
            i.push(r.requireTokenType("IDENTIFIER", "NUMBER").value);
          } while (r.matchOpToken(a.value));
        }
        return {
          type: "dotOrColonPath",
          path: i,
          evaluate: function () {
            return i.join(a ? a.value : "");
          },
        };
      }
    });
    t.addGrammarElement("eventName", function (e, t, r) {
      var n;
      if ((n = r.matchTokenType("STRING"))) {
        return {
          evaluate: function () {
            return n.value;
          },
        };
      }
      return e.parseElement("dotOrColonPath", r);
    });
    function d(e, t, r, n) {
      var i = t.requireElement("eventName", n);
      var a = t.parseElement("namedArgumentList", n);
      if (
        (e === "send" && n.matchToken("to")) ||
        (e === "trigger" && n.matchToken("on"))
      ) {
        var o = t.requireElement("expression", n);
      } else {
        var o = t.requireElement("implicitMeTarget", n);
      }
      var s = {
        eventName: i,
        details: a,
        to: o,
        args: [o, i, a],
        op: function (e, t, n, i) {
          r.nullCheck(t, o);
          r.implicitLoop(t, function (t) {
            r.triggerEvent(t, n, i, e.me);
          });
          return r.findNext(s, e);
        },
      };
      return s;
    }
    t.addCommand("trigger", function (e, t, r) {
      if (r.matchToken("trigger")) {
        return d("trigger", e, t, r);
      }
    });
    t.addCommand("send", function (e, t, r) {
      if (r.matchToken("send")) {
        return d("send", e, t, r);
      }
    });
    var T = function (e, t, r, n) {
      if (n) {
        if (e.commandBoundary(r.currentToken())) {
          e.raiseParseError(
            r,
            "'return' commands must return a value.  If you do not wish to return a value, use 'exit' instead."
          );
        } else {
          var i = e.requireElement("expression", r);
        }
      }
      var a = {
        value: i,
        args: [i],
        op: function (e, r) {
          var n = e.meta.resolve;
          e.meta.returned = true;
          e.meta.returnValue = r;
          if (n) {
            if (r) {
              n(r);
            } else {
              n();
            }
          }
          return t.HALT;
        },
      };
      return a;
    };
    t.addCommand("return", function (e, t, r) {
      if (r.matchToken("return")) {
        return T(e, t, r, true);
      }
    });
    t.addCommand("exit", function (e, t, r) {
      if (r.matchToken("exit")) {
        return T(e, t, r, false);
      }
    });
    t.addCommand("halt", function (e, t, r) {
      if (r.matchToken("halt")) {
        if (r.matchToken("the")) {
          r.requireToken("event");
          if (r.matchOpToken("'")) {
            r.requireToken("s");
          }
          var n = true;
        }
        if (r.matchToken("bubbling")) {
          var i = true;
        } else if (r.matchToken("default")) {
          var a = true;
        }
        var o = T(e, t, r, false);
        var s = {
          keepExecuting: true,
          bubbling: i,
          haltDefault: a,
          exit: o,
          op: function (e) {
            if (e.event) {
              if (i) {
                e.event.stopPropagation();
              } else if (a) {
                e.event.preventDefault();
              } else {
                e.event.stopPropagation();
                e.event.preventDefault();
              }
              if (n) {
                return t.findNext(this, e);
              } else {
                return o;
              }
            }
          },
        };
        return s;
      }
    });
    t.addCommand("log", function (e, t, r) {
      if (!r.matchToken("log")) return;
      var n = [e.parseElement("expression", r)];
      while (r.matchOpToken(",")) {
        n.push(e.requireElement("expression", r));
      }
      if (r.matchToken("with")) {
        var i = e.requireElement("expression", r);
      }
      var a = {
        exprs: n,
        withExpr: i,
        args: [i, n],
        op: function (e, r, n) {
          if (r) {
            r.apply(null, n);
          } else {
            console.log.apply(null, n);
          }
          return t.findNext(this, e);
        },
      };
      return a;
    });
    t.addCommand("beep!", function (e, t, r) {
      if (!r.matchToken("beep!")) return;
      var n = [e.parseElement("expression", r)];
      while (r.matchOpToken(",")) {
        n.push(e.requireElement("expression", r));
      }
      var i = {
        exprs: n,
        args: [n],
        op: function (e, r) {
          for (let i = 0; i < n.length; i++) {
            const a = n[i];
            const o = r[i];
            t.beepValueToConsole(e.me, a, o);
          }
          return t.findNext(this, e);
        },
      };
      return i;
    });
    t.addCommand("throw", function (e, t, r) {
      if (!r.matchToken("throw")) return;
      var n = e.requireElement("expression", r);
      var i = {
        expr: n,
        args: [n],
        op: function (e, r) {
          t.registerHyperTrace(e, r);
          throw r;
        },
      };
      return i;
    });
    var y = function (e, t, r) {
      var n = e.requireElement("expression", r);
      var i = {
        expr: n,
        args: [n],
        op: function (e, r) {
          e.result = r;
          return t.findNext(i, e);
        },
      };
      return i;
    };
    t.addCommand("call", function (e, t, r) {
      if (!r.matchToken("call")) return;
      var n = y(e, t, r);
      if (n.expr && n.expr.type !== "functionCall") {
        e.raiseParseError(r, "Must be a function invocation");
      }
      return n;
    });
    t.addCommand("get", function (e, t, r) {
      if (r.matchToken("get")) {
        return y(e, t, r);
      }
    });
    t.addCommand("make", function (e, t, r) {
      if (!r.matchToken("make")) return;
      r.matchToken("a") || r.matchToken("an");
      var n = e.requireElement("expression", r);
      var i = [];
      if (n.type !== "queryRef" && r.matchToken("from")) {
        do {
          i.push(e.requireElement("expression", r));
        } while (r.matchOpToken(","));
      }
      if (r.matchToken("called")) {
        var a = e.requireElement("symbol", r);
      }
      var o;
      if (n.type === "queryRef") {
        o = {
          op: function (e) {
            var r,
              i = "div",
              o,
              s = [];
            var u = /(?:(^|#|\.)([^#\. ]+))/g;
            while ((r = u.exec(n.css))) {
              if (r[1] === "") i = r[2].trim();
              else if (r[1] === "#") o = r[2].trim();
              else s.push(r[2].trim());
            }
            var l = document.createElement(i);
            if (o !== undefined) l.id = o;
            for (var c = 0; c < s.length; c++) {
              var f = s[c];
              l.classList.add(f);
            }
            e.result = l;
            if (a) {
              t.setSymbol(a.name, e, a.scope, l);
            }
            return t.findNext(this, e);
          },
        };
        return o;
      } else {
        o = {
          args: [n, i],
          op: function (e, r, n) {
            e.result = E(r, n);
            if (a) {
              t.setSymbol(a.name, e, a.scope, e.result);
            }
            return t.findNext(this, e);
          },
        };
        return o;
      }
    });
    t.addGrammarElement("pseudoCommand", function (e, t, r) {
      let n = r.token(1);
      if (!(n && n.op && (n.value === "." || n.value === "("))) {
        return null;
      }
      var i = e.requireElement("primaryExpression", r);
      var a = i.root;
      var o = i;
      while (a.root != null) {
        o = o.root;
        a = a.root;
      }
      if (i.type !== "functionCall") {
        e.raiseParseError(r, "Pseudo-commands must be function calls");
      }
      if (o.type === "functionCall" && o.root.root == null) {
        if (r.matchAnyToken("the", "to", "on", "with", "into", "from", "at")) {
          var s = e.requireElement("expression", r);
        } else if (r.matchToken("me")) {
          var s = e.requireElement("implicitMeTarget", r);
        }
      }
      var u;
      if (s) {
        u = {
          type: "pseudoCommand",
          root: s,
          argExressions: o.argExressions,
          args: [s, o.argExressions],
          op: function (e, r, n) {
            t.nullCheck(r, s);
            var i = r[o.root.name];
            t.nullCheck(i, o);
            if (i.hyperfunc) {
              n.push(e);
            }
            e.result = i.apply(r, n);
            return t.findNext(u, e);
          },
          execute: function (e) {
            return t.unifiedExec(this, e);
          },
        };
      } else {
        u = {
          type: "pseudoCommand",
          expr: i,
          args: [i],
          op: function (e, r) {
            e.result = r;
            return t.findNext(u, e);
          },
          execute: function (e) {
            return t.unifiedExec(this, e);
          },
        };
      }
      return u;
    });
    var k = function (e, t, r, n, i) {
      var a = n.type === "symbol";
      var o = n.type === "attributeRef";
      var s = n.type === "styleRef";
      var u = n.type === "arrayIndex";
      if (!(o || s || a) && n.root == null) {
        e.raiseParseError(
          r,
          "Can only put directly into symbols, not references"
        );
      }
      var l = null;
      var c = null;
      if (a) {
      } else if (o || s) {
        l = e.requireElement("implicitMeTarget", r);
        var f = n;
      } else if (u) {
        c = n.firstIndex;
        l = n.root;
      } else {
        c = n.prop ? n.prop.value : null;
        var f = n.attribute;
        l = n.root;
      }
      var m = {
        target: n,
        symbolWrite: a,
        value: i,
        args: [l, c, i],
        op: function (e, r, i, o) {
          if (a) {
            t.setSymbol(n.name, e, n.scope, o);
          } else {
            t.nullCheck(r, l);
            if (u) {
              r[i] = o;
            } else {
              t.implicitLoop(r, function (e) {
                if (f) {
                  if (f.type === "attributeRef") {
                    if (o == null) {
                      e.removeAttribute(f.name);
                    } else {
                      e.setAttribute(f.name, o);
                    }
                  } else {
                    e.style[f.name] = o;
                  }
                } else {
                  e[i] = o;
                }
              });
            }
          }
          return t.findNext(this, e);
        },
      };
      return m;
    };
    t.addCommand("default", function (e, t, r) {
      if (!r.matchToken("default")) return;
      var n = e.requireElement("assignableExpression", r);
      r.requireToken("to");
      var i = e.requireElement("expression", r);
      var a = k(e, t, r, n, i);
      var o = {
        target: n,
        value: i,
        setter: a,
        args: [n],
        op: function (e, r) {
          if (r) {
            return t.findNext(this, e);
          } else {
            return a;
          }
        },
      };
      a.parent = o;
      return o;
    });
    t.addCommand("set", function (e, t, r) {
      if (!r.matchToken("set")) return;
      if (r.currentToken().type === "L_BRACE") {
        var n = e.requireElement("objectLiteral", r);
        r.requireToken("on");
        var i = e.requireElement("expression", r);
        var a = {
          objectLiteral: n,
          target: i,
          args: [n, i],
          op: function (e, r, n) {
            Object.assign(n, r);
            return t.findNext(this, e);
          },
        };
        return a;
      }
      try {
        r.pushFollow("to");
        var i = e.requireElement("assignableExpression", r);
      } finally {
        r.popFollow();
      }
      r.requireToken("to");
      var o = e.requireElement("expression", r);
      return k(e, t, r, i, o);
    });
    t.addCommand("if", function (e, t, r) {
      if (!r.matchToken("if")) return;
      var n = e.requireElement("expression", r);
      r.matchToken("then");
      var i = e.parseElement("commandList", r);
      var a = false;
      let o = r.matchToken("else") || r.matchToken("otherwise");
      if (o) {
        let t = r.peekToken("if");
        a = t != null && t.line === o.line;
        if (a) {
          var s = e.parseElement("command", r);
        } else {
          var s = e.parseElement("commandList", r);
        }
      }
      if (r.hasMore() && !a) {
        r.requireToken("end");
      }
      var u = {
        expr: n,
        trueBranch: i,
        falseBranch: s,
        args: [n],
        op: function (e, r) {
          if (r) {
            return i;
          } else if (s) {
            return s;
          } else {
            return t.findNext(this, e);
          }
        },
      };
      e.setParent(i, u);
      e.setParent(s, u);
      return u;
    });
    var x = function (e, t, r, n) {
      var i = t.currentToken();
      var a;
      if (t.matchToken("for") || n) {
        var o = t.requireTokenType("IDENTIFIER");
        a = o.value;
        t.requireToken("in");
        var s = e.requireElement("expression", t);
      } else if (t.matchToken("in")) {
        a = "it";
        var s = e.requireElement("expression", t);
      } else if (t.matchToken("while")) {
        var u = e.requireElement("expression", t);
      } else if (t.matchToken("until")) {
        var l = true;
        if (t.matchToken("event")) {
          var c = e.requireElement("dotOrColonPath", t, "Expected event name");
          if (t.matchToken("from")) {
            var f = e.requireElement("expression", t);
          }
        } else {
          var u = e.requireElement("expression", t);
        }
      } else {
        if (
          !e.commandBoundary(t.currentToken()) &&
          t.currentToken().value !== "forever"
        ) {
          var m = e.requireElement("expression", t);
          t.requireToken("times");
        } else {
          t.matchToken("forever");
          var p = true;
        }
      }
      if (t.matchToken("index")) {
        var o = t.requireTokenType("IDENTIFIER");
        var h = o.value;
      }
      var v = e.parseElement("commandList", t);
      if (v && c) {
        var d = v;
        while (d.next) {
          d = d.next;
        }
        var E = {
          type: "waitATick",
          op: function () {
            return new Promise(function (e) {
              setTimeout(function () {
                e(r.findNext(E));
              }, 0);
            });
          },
        };
        d.next = E;
      }
      if (t.hasMore()) {
        t.requireToken("end");
      }
      if (a == null) {
        a = "_implicit_repeat_" + i.start;
        var T = a;
      } else {
        var T = a + "_" + i.start;
      }
      var y = {
        identifier: a,
        indexIdentifier: h,
        slot: T,
        expression: s,
        forever: p,
        times: m,
        until: l,
        event: c,
        on: f,
        whileExpr: u,
        resolveNext: function () {
          return this;
        },
        loop: v,
        args: [u, m],
        op: function (e, t, n) {
          var i = e.meta.iterators[T];
          var o = false;
          var s = null;
          if (this.forever) {
            o = true;
          } else if (this.until) {
            if (c) {
              o = e.meta.iterators[T].eventFired === false;
            } else {
              o = t !== true;
            }
          } else if (u) {
            o = t;
          } else if (n) {
            o = i.index < n;
          } else {
            var l = i.iterator.next();
            o = !l.done;
            s = l.value;
          }
          if (o) {
            if (i.value) {
              e.result = e.locals[a] = s;
            } else {
              e.result = i.index;
            }
            if (h) {
              e.locals[h] = i.index;
            }
            i.index++;
            return v;
          } else {
            e.meta.iterators[T] = null;
            return r.findNext(this.parent, e);
          }
        },
      };
      e.setParent(v, y);
      var k = {
        name: "repeatInit",
        args: [s, c, f],
        op: function (e, t, r, n) {
          var i = { index: 0, value: t, eventFired: false };
          e.meta.iterators[T] = i;
          if (t && t[Symbol.iterator]) {
            i.iterator = t[Symbol.iterator]();
          }
          if (c) {
            var a = n || e.me;
            a.addEventListener(
              r,
              function (t) {
                e.meta.iterators[T].eventFired = true;
              },
              { once: true }
            );
          }
          return y;
        },
        execute: function (e) {
          return r.unifiedExec(this, e);
        },
      };
      e.setParent(y, k);
      return k;
    };
    t.addCommand("repeat", function (e, t, r) {
      if (r.matchToken("repeat")) {
        return x(e, r, t, false);
      }
    });
    t.addCommand("for", function (e, t, r) {
      if (r.matchToken("for")) {
        return x(e, r, t, true);
      }
    });
    t.addCommand("continue", function (e, t, r) {
      if (!r.matchToken("continue")) return;
      var n = {
        op: function (t) {
          for (var n = this.parent; true; n = n.parent) {
            if (n == undefined) {
              e.raiseParseError(
                r,
                "Command `continue` cannot be used outside of a `repeat` loop."
              );
            }
            if (n.loop != undefined) {
              return n.resolveNext(t);
            }
          }
        },
      };
      return n;
    });
    t.addCommand("break", function (e, t, r) {
      if (!r.matchToken("break")) return;
      var n = {
        op: function (n) {
          for (var i = this.parent; true; i = i.parent) {
            if (i == undefined) {
              e.raiseParseError(
                r,
                "Command `continue` cannot be used outside of a `repeat` loop."
              );
            }
            if (i.loop != undefined) {
              return t.findNext(i.parent, n);
            }
          }
        },
      };
      return n;
    });
    t.addGrammarElement("stringLike", function (e, t, r) {
      return e.parseAnyOf(["string", "nakedString"], r);
    });
    t.addCommand("append", function (e, t, r) {
      if (!r.matchToken("append")) return;
      var n = null;
      var i = e.requireElement("expression", r);
      var a = {
        type: "symbol",
        evaluate: function (e) {
          return t.resolveSymbol("result", e);
        },
      };
      if (r.matchToken("to")) {
        n = e.requireElement("expression", r);
      } else {
        n = a;
      }
      var o = null;
      if (n.type === "symbol" || n.type === "attributeRef" || n.root != null) {
        o = k(e, t, r, n, a);
      }
      var s = {
        value: i,
        target: n,
        args: [n, i],
        op: function (e, r, n) {
          if (Array.isArray(r)) {
            r.push(n);
            return t.findNext(this, e);
          } else if (r instanceof Element) {
            r.innerHTML += n;
            return t.findNext(this, e);
          } else if (o) {
            e.result = (r || "") + n;
            return o;
          } else {
            throw Error("Unable to append a value!");
          }
        },
        execute: function (e) {
          return t.unifiedExec(this, e);
        },
      };
      if (o != null) {
        o.parent = s;
      }
      return s;
    });
    function g(e, t, r) {
      r.matchToken("at") || r.matchToken("from");
      const n = { includeStart: true, includeEnd: false };
      n.from = r.matchToken("start") ? 0 : e.requireElement("expression", r);
      if (r.matchToken("to") || r.matchOpToken("..")) {
        if (r.matchToken("end")) {
          n.toEnd = true;
        } else {
          n.to = e.requireElement("expression", r);
        }
      }
      if (r.matchToken("inclusive")) n.includeEnd = true;
      else if (r.matchToken("exclusive")) n.includeStart = false;
      return n;
    }
    class b {
      constructor(e, t) {
        this.re = e;
        this.str = t;
      }
      next() {
        const e = this.re.exec(this.str);
        if (e === null) return { done: true };
        else return { value: e };
      }
    }
    class w {
      constructor(e, t, r) {
        this.re = e;
        this.flags = t;
        this.str = r;
      }
      [Symbol.iterator]() {
        return new b(new RegExp(this.re, this.flags), this.str);
      }
    }
    t.addCommand("pick", (e, t, r) => {
      if (!r.matchToken("pick")) return;
      r.matchToken("the");
      if (
        r.matchToken("item") ||
        r.matchToken("items") ||
        r.matchToken("character") ||
        r.matchToken("characters")
      ) {
        const n = g(e, t, r);
        r.requireToken("from");
        const i = e.requireElement("expression", r);
        return {
          args: [i, n.from, n.to],
          op(e, r, i, a) {
            if (n.toEnd) a = r.length;
            if (!n.includeStart) i++;
            if (n.includeEnd) a++;
            if (a == null || a == undefined) a = i + 1;
            e.result = r.slice(i, a);
            return t.findNext(this, e);
          },
        };
      }
      if (r.matchToken("match")) {
        r.matchToken("of");
        const n = e.parseElement("expression", r);
        let i = "";
        if (r.matchOpToken("|")) {
          i = r.requireToken("identifier").value;
        }
        r.requireToken("from");
        const a = e.parseElement("expression", r);
        return {
          args: [a, n],
          op(e, r, n) {
            e.result = new RegExp(n, i).exec(r);
            return t.findNext(this, e);
          },
        };
      }
      if (r.matchToken("matches")) {
        r.matchToken("of");
        const n = e.parseElement("expression", r);
        let i = "gu";
        if (r.matchOpToken("|")) {
          i = "g" + r.requireToken("identifier").value.replace("g", "");
        }
        console.log("flags", i);
        r.requireToken("from");
        const a = e.parseElement("expression", r);
        return {
          args: [a, n],
          op(e, r, n) {
            e.result = new w(n, i, r);
            return t.findNext(this, e);
          },
        };
      }
    });
    t.addCommand("increment", function (e, t, r) {
      if (!r.matchToken("increment")) return;
      var n;
      var i = e.parseElement("assignableExpression", r);
      if (r.matchToken("by")) {
        n = e.requireElement("expression", r);
      }
      var a = {
        type: "implicitIncrementOp",
        target: i,
        args: [i, n],
        op: function (e, t, r) {
          t = t ? parseFloat(t) : 0;
          r = n ? parseFloat(r) : 1;
          var i = t + r;
          e.result = i;
          return i;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return k(e, t, r, i, a);
    });
    t.addCommand("decrement", function (e, t, r) {
      if (!r.matchToken("decrement")) return;
      var n;
      var i = e.parseElement("assignableExpression", r);
      if (r.matchToken("by")) {
        n = e.requireElement("expression", r);
      }
      var a = {
        type: "implicitDecrementOp",
        target: i,
        args: [i, n],
        op: function (e, t, r) {
          t = t ? parseFloat(t) : 0;
          r = n ? parseFloat(r) : 1;
          var i = t - r;
          e.result = i;
          return i;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
      return k(e, t, r, i, a);
    });
    function S(e, t) {
      var r = "text";
      var n;
      e.matchToken("a") || e.matchToken("an");
      if (e.matchToken("json") || e.matchToken("Object")) {
        r = "json";
      } else if (e.matchToken("response")) {
        r = "response";
      } else if (e.matchToken("html")) {
        r = "html";
      } else if (e.matchToken("text")) {
      } else {
        n = t.requireElement("dotOrColonPath", e).evaluate();
      }
      return { type: r, conversion: n };
    }
    t.addCommand("fetch", function (e, t, r) {
      if (!r.matchToken("fetch")) return;
      var n = e.requireElement("stringLike", r);
      if (r.matchToken("as")) {
        var i = S(r, e);
      }
      if (r.matchToken("with") && r.currentToken().value !== "{") {
        var a = e.parseElement("nakedNamedArgumentList", r);
      } else {
        var a = e.parseElement("objectLiteral", r);
      }
      if (i == null && r.matchToken("as")) {
        i = S(r, e);
      }
      var o = i ? i.type : "text";
      var s = i ? i.conversion : null;
      var u = {
        url: n,
        argExpressions: a,
        args: [n, a],
        op: function (e, r, n) {
          var i = n || {};
          i["sender"] = e.me;
          i["headers"] = i["headers"] || {};
          var a = new AbortController();
          let l = e.me.addEventListener(
            "fetch:abort",
            function () {
              a.abort();
            },
            { once: true }
          );
          i["signal"] = a.signal;
          t.triggerEvent(e.me, "hyperscript:beforeFetch", i);
          t.triggerEvent(e.me, "fetch:beforeRequest", i);
          n = i;
          var c = false;
          if (n.timeout) {
            setTimeout(function () {
              if (!c) {
                a.abort();
              }
            }, n.timeout);
          }
          return fetch(r, n)
            .then(function (r) {
              let n = { response: r };
              t.triggerEvent(e.me, "fetch:afterResponse", n);
              r = n.response;
              if (o === "response") {
                e.result = r;
                t.triggerEvent(e.me, "fetch:afterRequest", { result: r });
                c = true;
                return t.findNext(u, e);
              }
              if (o === "json") {
                return r.json().then(function (r) {
                  e.result = r;
                  t.triggerEvent(e.me, "fetch:afterRequest", { result: r });
                  c = true;
                  return t.findNext(u, e);
                });
              }
              return r.text().then(function (r) {
                if (s) r = t.convertValue(r, s);
                if (o === "html") r = t.convertValue(r, "Fragment");
                e.result = r;
                t.triggerEvent(e.me, "fetch:afterRequest", { result: r });
                c = true;
                return t.findNext(u, e);
              });
            })
            .catch(function (r) {
              t.triggerEvent(e.me, "fetch:error", { reason: r });
              throw r;
            })
            .finally(function () {
              e.me.removeEventListener("fetch:abort", l);
            });
        },
      };
      return u;
    });
  }
  function y(e) {
    e.addCommand("settle", function (e, t, r) {
      if (r.matchToken("settle")) {
        if (!e.commandBoundary(r.currentToken())) {
          var n = e.requireElement("expression", r);
        } else {
          var n = e.requireElement("implicitMeTarget", r);
        }
        var i = {
          type: "settleCmd",
          args: [n],
          op: function (e, r) {
            t.nullCheck(r, n);
            var a = null;
            var o = false;
            var s = false;
            var u = new Promise(function (e) {
              a = e;
            });
            r.addEventListener(
              "transitionstart",
              function () {
                s = true;
              },
              { once: true }
            );
            setTimeout(function () {
              if (!s && !o) {
                a(t.findNext(i, e));
              }
            }, 500);
            r.addEventListener(
              "transitionend",
              function () {
                if (!o) {
                  a(t.findNext(i, e));
                }
              },
              { once: true }
            );
            return u;
          },
          execute: function (e) {
            return t.unifiedExec(this, e);
          },
        };
        return i;
      }
    });
    e.addCommand("add", function (e, t, r) {
      if (r.matchToken("add")) {
        var n = e.parseElement("classRef", r);
        var i = null;
        var a = null;
        if (n == null) {
          i = e.parseElement("attributeRef", r);
          if (i == null) {
            a = e.parseElement("styleLiteral", r);
            if (a == null) {
              e.raiseParseError(
                r,
                "Expected either a class reference or attribute expression"
              );
            }
          }
        } else {
          var o = [n];
          while ((n = e.parseElement("classRef", r))) {
            o.push(n);
          }
        }
        if (r.matchToken("to")) {
          var s = e.requireElement("expression", r);
        } else {
          var s = e.requireElement("implicitMeTarget", r);
        }
        if (r.matchToken("when")) {
          if (a) {
            e.raiseParseError(
              r,
              "Only class and properties are supported with a when clause"
            );
          }
          var u = e.requireElement("expression", r);
        }
        if (o) {
          return {
            classRefs: o,
            to: s,
            args: [s, o],
            op: function (e, r, n) {
              t.nullCheck(r, s);
              t.forEach(n, function (n) {
                t.implicitLoop(r, function (r) {
                  if (u) {
                    e.result = r;
                    let i = t.evaluateNoPromise(u, e);
                    if (i) {
                      if (r instanceof Element) r.classList.add(n.className);
                    } else {
                      if (r instanceof Element) r.classList.remove(n.className);
                    }
                    e.result = null;
                  } else {
                    if (r instanceof Element) r.classList.add(n.className);
                  }
                });
              });
              return t.findNext(this, e);
            },
          };
        } else if (i) {
          return {
            type: "addCmd",
            attributeRef: i,
            to: s,
            args: [s],
            op: function (e, r, n) {
              t.nullCheck(r, s);
              t.implicitLoop(r, function (r) {
                if (u) {
                  e.result = r;
                  let n = t.evaluateNoPromise(u, e);
                  if (n) {
                    r.setAttribute(i.name, i.value);
                  } else {
                    r.removeAttribute(i.name);
                  }
                  e.result = null;
                } else {
                  r.setAttribute(i.name, i.value);
                }
              });
              return t.findNext(this, e);
            },
            execute: function (e) {
              return t.unifiedExec(this, e);
            },
          };
        } else {
          return {
            type: "addCmd",
            cssDeclaration: a,
            to: s,
            args: [s, a],
            op: function (e, r, n) {
              t.nullCheck(r, s);
              t.implicitLoop(r, function (e) {
                e.style.cssText += n;
              });
              return t.findNext(this, e);
            },
            execute: function (e) {
              return t.unifiedExec(this, e);
            },
          };
        }
      }
    });
    e.addGrammarElement("styleLiteral", function (e, t, r) {
      if (!r.matchOpToken("{")) return;
      var n = [""];
      var i = [];
      while (r.hasMore()) {
        if (r.matchOpToken("\\")) {
          r.consumeToken();
        } else if (r.matchOpToken("}")) {
          break;
        } else if (r.matchToken("$")) {
          var a = r.matchOpToken("{");
          var o = e.parseElement("expression", r);
          if (a) r.requireOpToken("}");
          i.push(o);
          n.push("");
        } else {
          var s = r.consumeToken();
          n[n.length - 1] += r.source.substring(s.start, s.end);
        }
        n[n.length - 1] += r.lastWhitespace();
      }
      return {
        type: "styleLiteral",
        args: [i],
        op: function (e, t) {
          var r = "";
          n.forEach(function (e, n) {
            r += e;
            if (n in t) r += t[n];
          });
          return r;
        },
        evaluate: function (e) {
          return t.unifiedEval(this, e);
        },
      };
    });
    e.addCommand("remove", function (e, t, r) {
      if (r.matchToken("remove")) {
        var n = e.parseElement("classRef", r);
        var i = null;
        var a = null;
        if (n == null) {
          i = e.parseElement("attributeRef", r);
          if (i == null) {
            a = e.parseElement("expression", r);
            if (a == null) {
              e.raiseParseError(
                r,
                "Expected either a class reference, attribute expression or value expression"
              );
            }
          }
        } else {
          var o = [n];
          while ((n = e.parseElement("classRef", r))) {
            o.push(n);
          }
        }
        if (r.matchToken("from")) {
          var s = e.requireElement("expression", r);
        } else {
          if (a == null) {
            var s = e.requireElement("implicitMeTarget", r);
          }
        }
        if (a) {
          return {
            elementExpr: a,
            from: s,
            args: [a, s],
            op: function (e, r, n) {
              t.nullCheck(r, a);
              t.implicitLoop(r, function (e) {
                if (e.parentElement && (n == null || n.contains(e))) {
                  e.parentElement.removeChild(e);
                }
              });
              return t.findNext(this, e);
            },
          };
        } else {
          return {
            classRefs: o,
            attributeRef: i,
            elementExpr: a,
            from: s,
            args: [o, s],
            op: function (e, r, n) {
              t.nullCheck(n, s);
              if (r) {
                t.forEach(r, function (e) {
                  t.implicitLoop(n, function (t) {
                    t.classList.remove(e.className);
                  });
                });
              } else {
                t.implicitLoop(n, function (e) {
                  e.removeAttribute(i.name);
                });
              }
              return t.findNext(this, e);
            },
          };
        }
      }
    });
    e.addCommand("toggle", function (e, t, r) {
      if (r.matchToken("toggle")) {
        r.matchAnyToken("the", "my");
        if (r.currentToken().type === "STYLE_REF") {
          let t = r.consumeToken();
          var n = t.value.substr(1);
          var a = true;
          var o = i(e, r, n);
          if (r.matchToken("of")) {
            r.pushFollow("with");
            try {
              var s = e.requireElement("expression", r);
            } finally {
              r.popFollow();
            }
          } else {
            var s = e.requireElement("implicitMeTarget", r);
          }
        } else if (r.matchToken("between")) {
          var u = true;
          var l = e.parseElement("classRef", r);
          r.requireToken("and");
          var c = e.requireElement("classRef", r);
        } else {
          var l = e.parseElement("classRef", r);
          var f = null;
          if (l == null) {
            f = e.parseElement("attributeRef", r);
            if (f == null) {
              e.raiseParseError(
                r,
                "Expected either a class reference or attribute expression"
              );
            }
          } else {
            var m = [l];
            while ((l = e.parseElement("classRef", r))) {
              m.push(l);
            }
          }
        }
        if (a !== true) {
          if (r.matchToken("on")) {
            var s = e.requireElement("expression", r);
          } else {
            var s = e.requireElement("implicitMeTarget", r);
          }
        }
        if (r.matchToken("for")) {
          var p = e.requireElement("expression", r);
        } else if (r.matchToken("until")) {
          var h = e.requireElement("dotOrColonPath", r, "Expected event name");
          if (r.matchToken("from")) {
            var v = e.requireElement("expression", r);
          }
        }
        var d = {
          classRef: l,
          classRef2: c,
          classRefs: m,
          attributeRef: f,
          on: s,
          time: p,
          evt: h,
          from: v,
          toggle: function (e, r, n, i) {
            t.nullCheck(e, s);
            if (a) {
              t.implicitLoop(e, function (e) {
                o("toggle", e);
              });
            } else if (u) {
              t.implicitLoop(e, function (e) {
                if (e.classList.contains(r.className)) {
                  e.classList.remove(r.className);
                  e.classList.add(n.className);
                } else {
                  e.classList.add(r.className);
                  e.classList.remove(n.className);
                }
              });
            } else if (i) {
              t.forEach(i, function (r) {
                t.implicitLoop(e, function (e) {
                  e.classList.toggle(r.className);
                });
              });
            } else {
              t.forEach(e, function (e) {
                if (e.hasAttribute(f.name)) {
                  e.removeAttribute(f.name);
                } else {
                  e.setAttribute(f.name, f.value);
                }
              });
            }
          },
          args: [s, p, h, v, l, c, m],
          op: function (e, r, n, i, a, o, s, u) {
            if (n) {
              return new Promise(function (i) {
                d.toggle(r, o, s, u);
                setTimeout(function () {
                  d.toggle(r, o, s, u);
                  i(t.findNext(d, e));
                }, n);
              });
            } else if (i) {
              return new Promise(function (n) {
                var l = a || e.me;
                l.addEventListener(
                  i,
                  function () {
                    d.toggle(r, o, s, u);
                    n(t.findNext(d, e));
                  },
                  { once: true }
                );
                d.toggle(r, o, s, u);
              });
            } else {
              this.toggle(r, o, s, u);
              return t.findNext(d, e);
            }
          },
        };
        return d;
      }
    });
    var t = {
      display: function (r, n, i) {
        if (i) {
          n.style.display = i;
        } else if (r === "toggle") {
          if (getComputedStyle(n).display === "none") {
            t.display("show", n, i);
          } else {
            t.display("hide", n, i);
          }
        } else if (r === "hide") {
          const t = e.runtime.getInternalData(n);
          if (t.originalDisplay == null) {
            t.originalDisplay = n.style.display;
          }
          n.style.display = "none";
        } else {
          const t = e.runtime.getInternalData(n);
          if (t.originalDisplay && t.originalDisplay !== "none") {
            n.style.display = t.originalDisplay;
          } else {
            n.style.removeProperty("display");
          }
        }
      },
      visibility: function (e, r, n) {
        if (n) {
          r.style.visibility = n;
        } else if (e === "toggle") {
          if (getComputedStyle(r).visibility === "hidden") {
            t.visibility("show", r, n);
          } else {
            t.visibility("hide", r, n);
          }
        } else if (e === "hide") {
          r.style.visibility = "hidden";
        } else {
          r.style.visibility = "visible";
        }
      },
      opacity: function (e, r, n) {
        if (n) {
          r.style.opacity = n;
        } else if (e === "toggle") {
          if (getComputedStyle(r).opacity === "0") {
            t.opacity("show", r, n);
          } else {
            t.opacity("hide", r, n);
          }
        } else if (e === "hide") {
          r.style.opacity = "0";
        } else {
          r.style.opacity = "1";
        }
      },
    };
    var n = function (e, t, r) {
      var n;
      var i = r.currentToken();
      if (i.value === "when" || i.value === "with" || e.commandBoundary(i)) {
        n = e.parseElement("implicitMeTarget", r);
      } else {
        n = e.parseElement("expression", r);
      }
      return n;
    };
    var i = function (e, n, i) {
      var a = r.defaultHideShowStrategy;
      var o = t;
      if (r.hideShowStrategies) {
        o = Object.assign(o, r.hideShowStrategies);
      }
      i = i || a || "display";
      var s = o[i];
      if (s == null) {
        e.raiseParseError(n, "Unknown show/hide strategy : " + i);
      }
      return s;
    };
    e.addCommand("hide", function (e, t, r) {
      if (r.matchToken("hide")) {
        var a = n(e, t, r);
        var o = null;
        if (r.matchToken("with")) {
          o = r.requireTokenType("IDENTIFIER", "STYLE_REF").value;
          if (o.indexOf("*") === 0) {
            o = o.substr(1);
          }
        }
        var s = i(e, r, o);
        return {
          target: a,
          args: [a],
          op: function (e, r) {
            t.nullCheck(r, a);
            t.implicitLoop(r, function (e) {
              s("hide", e);
            });
            return t.findNext(this, e);
          },
        };
      }
    });
    e.addCommand("show", function (e, t, r) {
      if (r.matchToken("show")) {
        var a = n(e, t, r);
        var o = null;
        if (r.matchToken("with")) {
          o = r.requireTokenType("IDENTIFIER", "STYLE_REF").value;
          if (o.indexOf("*") === 0) {
            o = o.substr(1);
          }
        }
        var s = null;
        if (r.matchOpToken(":")) {
          var u = r.consumeUntilWhitespace();
          r.matchTokenType("WHITESPACE");
          s = u
            .map(function (e) {
              return e.value;
            })
            .join("");
        }
        if (r.matchToken("when")) {
          var l = e.requireElement("expression", r);
        }
        var c = i(e, r, o);
        return {
          target: a,
          when: l,
          args: [a],
          op: function (e, r) {
            t.nullCheck(r, a);
            t.implicitLoop(r, function (r) {
              if (l) {
                e.result = r;
                let n = t.evaluateNoPromise(l, e);
                if (n) {
                  c("show", r, s);
                } else {
                  c("hide", r);
                }
                e.result = null;
              } else {
                c("show", r, s);
              }
            });
            return t.findNext(this, e);
          },
        };
      }
    });
    e.addCommand("take", function (e, t, r) {
      if (r.matchToken("take")) {
        let u = null;
        let l = [];
        while ((u = e.parseElement("classRef", r))) {
          l.push(u);
        }
        var n = null;
        var i = null;
        let c = l.length > 0;
        if (!c) {
          n = e.parseElement("attributeRef", r);
          if (n == null) {
            e.raiseParseError(
              r,
              "Expected either a class reference or attribute expression"
            );
          }
          if (r.matchToken("with")) {
            i = e.requireElement("expression", r);
          }
        }
        if (r.matchToken("from")) {
          var a = e.requireElement("expression", r);
        }
        if (r.matchToken("for")) {
          var o = e.requireElement("expression", r);
        } else {
          var o = e.requireElement("implicitMeTarget", r);
        }
        if (c) {
          var s = {
            classRefs: l,
            from: a,
            forElt: o,
            args: [l, a, o],
            op: function (e, r, n, i) {
              t.nullCheck(i, o);
              t.implicitLoop(r, function (e) {
                var r = e.className;
                if (n) {
                  t.implicitLoop(n, function (e) {
                    e.classList.remove(r);
                  });
                } else {
                  t.implicitLoop(e, function (e) {
                    e.classList.remove(r);
                  });
                }
                t.implicitLoop(i, function (e) {
                  e.classList.add(r);
                });
              });
              return t.findNext(this, e);
            },
          };
          return s;
        } else {
          var s = {
            attributeRef: n,
            from: a,
            forElt: o,
            args: [a, o, i],
            op: function (e, r, i, s) {
              t.nullCheck(r, a);
              t.nullCheck(i, o);
              t.implicitLoop(r, function (e) {
                if (!s) {
                  e.removeAttribute(n.name);
                } else {
                  e.setAttribute(n.name, s);
                }
              });
              t.implicitLoop(i, function (e) {
                e.setAttribute(n.name, n.value || "");
              });
              return t.findNext(this, e);
            },
          };
          return s;
        }
      }
    });
    function a(t, r, n, i) {
      if (n != null) {
        var a = t.resolveSymbol(n, r);
      } else {
        var a = r;
      }
      if (a instanceof Element || a instanceof HTMLDocument) {
        while (a.firstChild) a.removeChild(a.firstChild);
        a.append(e.runtime.convertValue(i, "Fragment"));
        t.processNode(a);
      } else {
        if (n != null) {
          t.setSymbol(n, r, null, i);
        } else {
          throw "Don't know how to put a value into " + typeof r;
        }
      }
    }
    e.addCommand("put", function (e, t, r) {
      if (r.matchToken("put")) {
        var n = e.requireElement("expression", r);
        var i = r.matchAnyToken("into", "before", "after");
        if (i == null && r.matchToken("at")) {
          r.matchToken("the");
          i = r.matchAnyToken("start", "end");
          r.requireToken("of");
        }
        if (i == null) {
          e.raiseParseError(
            r,
            "Expected one of 'into', 'before', 'at start of', 'at end of', 'after'"
          );
        }
        var o = e.requireElement("expression", r);
        var s = i.value;
        var u = false;
        var l = false;
        var c = null;
        var f = null;
        if (o.type === "arrayIndex" && s === "into") {
          u = true;
          f = o.prop;
          c = o.root;
        } else if (o.prop && o.root && s === "into") {
          f = o.prop.value;
          c = o.root;
        } else if (o.type === "symbol" && s === "into") {
          l = true;
          f = o.name;
        } else if (o.type === "attributeRef" && s === "into") {
          var m = true;
          f = o.name;
          c = e.requireElement("implicitMeTarget", r);
        } else if (o.type === "styleRef" && s === "into") {
          var p = true;
          f = o.name;
          c = e.requireElement("implicitMeTarget", r);
        } else if (o.attribute && s === "into") {
          var m = o.attribute.type === "attributeRef";
          var p = o.attribute.type === "styleRef";
          f = o.attribute.name;
          c = o.root;
        } else {
          c = o;
        }
        var h = {
          target: o,
          operation: s,
          symbolWrite: l,
          value: n,
          args: [c, f, n],
          op: function (e, r, n, i) {
            if (l) {
              a(t, e, n, i);
            } else {
              t.nullCheck(r, c);
              if (s === "into") {
                if (m) {
                  t.implicitLoop(r, function (e) {
                    e.setAttribute(n, i);
                  });
                } else if (p) {
                  t.implicitLoop(r, function (e) {
                    e.style[n] = i;
                  });
                } else if (u) {
                  r[n] = i;
                } else {
                  t.implicitLoop(r, function (e) {
                    a(t, e, n, i);
                  });
                }
              } else {
                var o =
                  s === "before"
                    ? Element.prototype.before
                    : s === "after"
                      ? Element.prototype.after
                      : s === "start"
                        ? Element.prototype.prepend
                        : s === "end"
                          ? Element.prototype.append
                          : Element.prototype.append;
                t.implicitLoop(r, function (e) {
                  o.call(
                    e,
                    i instanceof Node ? i : t.convertValue(i, "Fragment")
                  );
                  if (e.parentElement) {
                    t.processNode(e.parentElement);
                  } else {
                    t.processNode(e);
                  }
                });
              }
            }
            return t.findNext(this, e);
          },
        };
        return h;
      }
    });
    function o(e, t, r) {
      var n;
      if (
        r.matchToken("the") ||
        r.matchToken("element") ||
        r.matchToken("elements") ||
        r.currentToken().type === "CLASS_REF" ||
        r.currentToken().type === "ID_REF" ||
        (r.currentToken().op && r.currentToken().value === "<")
      ) {
        e.possessivesDisabled = true;
        try {
          n = e.parseElement("expression", r);
        } finally {
          delete e.possessivesDisabled;
        }
        if (r.matchOpToken("'")) {
          r.requireToken("s");
        }
      } else if (
        r.currentToken().type === "IDENTIFIER" &&
        r.currentToken().value === "its"
      ) {
        var i = r.matchToken("its");
        n = {
          type: "pseudopossessiveIts",
          token: i,
          name: i.value,
          evaluate: function (e) {
            return t.resolveSymbol("it", e);
          },
        };
      } else {
        r.matchToken("my") || r.matchToken("me");
        n = e.parseElement("implicitMeTarget", r);
      }
      return n;
    }
    e.addCommand("transition", function (e, t, n) {
      if (n.matchToken("transition")) {
        var i = o(e, t, n);
        var a = [];
        var s = [];
        var u = [];
        var l = n.currentToken();
        while (
          !e.commandBoundary(l) &&
          l.value !== "over" &&
          l.value !== "using"
        ) {
          if (n.currentToken().type === "STYLE_REF") {
            let e = n.consumeToken();
            let t = e.value.substr(1);
            a.push({
              type: "styleRefValue",
              evaluate: function () {
                return t;
              },
            });
          } else {
            a.push(e.requireElement("stringLike", n));
          }
          if (n.matchToken("from")) {
            s.push(e.requireElement("expression", n));
          } else {
            s.push(null);
          }
          n.requireToken("to");
          if (n.matchToken("initial")) {
            u.push({
              type: "initial_literal",
              evaluate: function () {
                return "initial";
              },
            });
          } else {
            u.push(e.requireElement("expression", n));
          }
          l = n.currentToken();
        }
        if (n.matchToken("over")) {
          var c = e.requireElement("expression", n);
        } else if (n.matchToken("using")) {
          var f = e.requireElement("expression", n);
        }
        var m = {
          to: u,
          args: [i, a, s, u, f, c],
          op: function (e, n, a, o, s, u, l) {
            t.nullCheck(n, i);
            var c = [];
            t.implicitLoop(n, function (e) {
              var n = new Promise(function (n, i) {
                var c = e.style.transition;
                if (l) {
                  e.style.transition = "all " + l + "ms ease-in";
                } else if (u) {
                  e.style.transition = u;
                } else {
                  e.style.transition = r.defaultTransition;
                }
                var f = t.getInternalData(e);
                var m = getComputedStyle(e);
                var p = {};
                for (var h = 0; h < m.length; h++) {
                  var v = m[h];
                  var d = m[v];
                  p[v] = d;
                }
                if (!f.initialStyles) {
                  f.initialStyles = p;
                }
                for (var h = 0; h < a.length; h++) {
                  var E = a[h];
                  var T = o[h];
                  if (T === "computed" || T == null) {
                    e.style[E] = p[E];
                  } else {
                    e.style[E] = T;
                  }
                }
                var y = false;
                var k = false;
                e.addEventListener(
                  "transitionend",
                  function () {
                    if (!k) {
                      e.style.transition = c;
                      k = true;
                      n();
                    }
                  },
                  { once: true }
                );
                e.addEventListener(
                  "transitionstart",
                  function () {
                    y = true;
                  },
                  { once: true }
                );
                setTimeout(function () {
                  if (!k && !y) {
                    e.style.transition = c;
                    k = true;
                    n();
                  }
                }, 100);
                setTimeout(function () {
                  var t = [];
                  for (var r = 0; r < a.length; r++) {
                    var n = a[r];
                    var i = s[r];
                    if (i === "initial") {
                      var o = f.initialStyles[n];
                      e.style[n] = o;
                    } else {
                      e.style[n] = i;
                    }
                  }
                }, 0);
              });
              c.push(n);
            });
            return Promise.all(c).then(function () {
              return t.findNext(m, e);
            });
          },
        };
        return m;
      }
    });
    e.addCommand("measure", function (e, t, r) {
      if (!r.matchToken("measure")) return;
      var n = o(e, t, r);
      var i = [];
      if (!e.commandBoundary(r.currentToken()))
        do {
          i.push(r.matchTokenType("IDENTIFIER").value);
        } while (r.matchOpToken(","));
      return {
        properties: i,
        args: [n],
        op: function (e, r) {
          t.nullCheck(r, n);
          if (0 in r) r = r[0];
          var a = r.getBoundingClientRect();
          var o = {
            top: r.scrollTop,
            left: r.scrollLeft,
            topMax: r.scrollTopMax,
            leftMax: r.scrollLeftMax,
            height: r.scrollHeight,
            width: r.scrollWidth,
          };
          e.result = {
            x: a.x,
            y: a.y,
            left: a.left,
            top: a.top,
            right: a.right,
            bottom: a.bottom,
            width: a.width,
            height: a.height,
            bounds: a,
            scrollLeft: o.left,
            scrollTop: o.top,
            scrollLeftMax: o.leftMax,
            scrollTopMax: o.topMax,
            scrollWidth: o.width,
            scrollHeight: o.height,
            scroll: o,
          };
          t.forEach(i, function (t) {
            if (t in e.result) e.locals[t] = e.result[t];
            else throw "No such measurement as " + t;
          });
          return t.findNext(this, e);
        },
      };
    });
    e.addLeafExpression("closestExpr", function (e, t, r) {
      if (r.matchToken("closest")) {
        if (r.matchToken("parent")) {
          var n = true;
        }
        var i = null;
        if (r.currentToken().type === "ATTRIBUTE_REF") {
          var a = e.requireElement("attributeRefAccess", r, null);
          i = "[" + a.attribute.name + "]";
        }
        if (i == null) {
          var o = e.requireElement("expression", r);
          if (o.css == null) {
            e.raiseParseError(r, "Expected a CSS expression");
          } else {
            i = o.css;
          }
        }
        if (r.matchToken("to")) {
          var s = e.parseElement("expression", r);
        } else {
          var s = e.parseElement("implicitMeTarget", r);
        }
        var u = {
          type: "closestExpr",
          parentSearch: n,
          expr: o,
          css: i,
          to: s,
          args: [s],
          op: function (e, r) {
            if (r == null) {
              return null;
            } else {
              let e = [];
              t.implicitLoop(r, function (t) {
                if (n) {
                  e.push(t.parentElement ? t.parentElement.closest(i) : null);
                } else {
                  e.push(t.closest(i));
                }
              });
              if (t.shouldAutoIterate(r)) {
                return e;
              } else {
                return e[0];
              }
            }
          },
          evaluate: function (e) {
            return t.unifiedEval(this, e);
          },
        };
        if (a) {
          a.root = u;
          a.args = [u];
          return a;
        } else {
          return u;
        }
      }
    });
    e.addCommand("go", function (e, t, r) {
      if (r.matchToken("go")) {
        if (r.matchToken("back")) {
          var n = true;
        } else {
          r.matchToken("to");
          if (r.matchToken("url")) {
            var i = e.requireElement("stringLike", r);
            var a = true;
            if (r.matchToken("in")) {
              r.requireToken("new");
              r.requireToken("window");
              var o = true;
            }
          } else {
            r.matchToken("the");
            var s = r.matchAnyToken("top", "middle", "bottom");
            var u = r.matchAnyToken("left", "center", "right");
            if (s || u) {
              r.requireToken("of");
            }
            var i = e.requireElement("unaryExpression", r);
            var l = r.matchAnyOpToken("+", "-");
            if (l) {
              r.pushFollow("px");
              try {
                var c = e.requireElement("expression", r);
              } finally {
                r.popFollow();
              }
            }
            r.matchToken("px");
            var f = r.matchAnyToken("smoothly", "instantly");
            var m = { block: "start", inline: "nearest" };
            if (s) {
              if (s.value === "top") {
                m.block = "start";
              } else if (s.value === "bottom") {
                m.block = "end";
              } else if (s.value === "middle") {
                m.block = "center";
              }
            }
            if (u) {
              if (u.value === "left") {
                m.inline = "start";
              } else if (u.value === "center") {
                m.inline = "center";
              } else if (u.value === "right") {
                m.inline = "end";
              }
            }
            if (f) {
              if (f.value === "smoothly") {
                m.behavior = "smooth";
              } else if (f.value === "instantly") {
                m.behavior = "instant";
              }
            }
          }
        }
        var p = {
          target: i,
          args: [i, c],
          op: function (e, r, i) {
            if (n) {
              window.history.back();
            } else if (a) {
              if (r) {
                if (o) {
                  window.open(r);
                } else {
                  window.location.href = r;
                }
              }
            } else {
              t.implicitLoop(r, function (e) {
                if (e === window) {
                  e = document.body;
                }
                if (l) {
                  let t = e.getBoundingClientRect();
                  let r = document.createElement("div");
                  let n = l.value === "+" ? i : i * -1;
                  let a = m.inline == "start" || m.inline == "end" ? n : 0;
                  let o = m.block == "start" || m.block == "end" ? n : 0;
                  r.style.position = "absolute";
                  r.style.top = t.top + window.scrollY + o + "px";
                  r.style.left = t.left + window.scrollX + a + "px";
                  r.style.height = t.height + "px";
                  r.style.width = t.width + "px";
                  r.style.zIndex = "" + Number.MIN_SAFE_INTEGER;
                  r.style.opacity = "0";
                  document.body.appendChild(r);
                  setTimeout(function () {
                    document.body.removeChild(r);
                  }, 100);
                  e = r;
                }
                e.scrollIntoView(m);
              });
            }
            return t.findNext(p, e);
          },
        };
        return p;
      }
    });
    r.conversions.dynamicResolvers.push(function (t, r) {
      if (!(t === "Values" || t.indexOf("Values:") === 0)) {
        return;
      }
      var n = t.split(":")[1];
      var i = {};
      var a = e.runtime.implicitLoop.bind(e.runtime);
      a(r, function (e) {
        var t = s(e);
        if (t !== undefined) {
          i[t.name] = t.value;
          return;
        }
        if (e.querySelectorAll != undefined) {
          var r = e.querySelectorAll("input,select,textarea");
          r.forEach(o);
        }
      });
      if (n) {
        if (n === "JSON") {
          return JSON.stringify(i);
        } else if (n === "Form") {
          return new URLSearchParams(i).toString();
        } else {
          throw "Unknown conversion: " + n;
        }
      } else {
        return i;
      }
      function o(e) {
        var t = s(e);
        if (t == undefined) {
          return;
        }
        if (i[t.name] == undefined) {
          i[t.name] = t.value;
          return;
        }
        if (Array.isArray(i[t.name]) && Array.isArray(t.value)) {
          i[t.name] = [].concat(i[t.name], t.value);
          return;
        }
      }
      function s(e) {
        try {
          var t = { name: e.name, value: e.value };
          if (t.name == undefined || t.value == undefined) {
            return undefined;
          }
          if (e.type == "radio" && e.checked == false) {
            return undefined;
          }
          if (e.type == "checkbox") {
            if (e.checked == false) {
              t.value = undefined;
            } else if (typeof t.value === "string") {
              t.value = [t.value];
            }
          }
          if (e.type == "select-multiple") {
            var r = e.querySelectorAll("option[selected]");
            t.value = [];
            for (var n = 0; n < r.length; n++) {
              t.value.push(r[n].value);
            }
          }
          return t;
        } catch (e) {
          return undefined;
        }
      }
    });
    r.conversions["HTML"] = function (e) {
      var t = function (e) {
        if (e instanceof Array) {
          return e
            .map(function (e) {
              return t(e);
            })
            .join("");
        }
        if (e instanceof HTMLElement) {
          return e.outerHTML;
        }
        if (e instanceof NodeList) {
          var r = "";
          for (var n = 0; n < e.length; n++) {
            var i = e[n];
            if (i instanceof HTMLElement) {
              r += i.outerHTML;
            }
          }
          return r;
        }
        if (e.toString) {
          return e.toString();
        }
        return "";
      };
      return t(e);
    };
    r.conversions["Fragment"] = function (t) {
      var r = document.createDocumentFragment();
      e.runtime.implicitLoop(t, function (e) {
        if (e instanceof Node) r.append(e);
        else {
          var t = document.createElement("template");
          t.innerHTML = e;
          r.append(t.content);
        }
      });
      return r;
    };
  }
  const k = new o(),
    x = k.lexer,
    g = k.parser;
  function b(e, t) {
    return k.evaluate(e, t);
  }
  function w() {
    var t = Array.from(
      e.document.querySelectorAll("script[type='text/hyperscript'][src]")
    );
    Promise.all(
      t.map(function (e) {
        return fetch(e.src).then(function (e) {
          return e.text();
        });
      })
    )
      .then((e) => e.forEach((e) => S(e)))
      .then(() =>
        n(function () {
          a();
          k.processNode(document.documentElement);
          e.document.addEventListener("htmx:load", function (e) {
            k.processNode(e.detail.elt);
          });
        })
      );
    function n(e) {
      if (document.readyState !== "loading") {
        setTimeout(e);
      } else {
        document.addEventListener("DOMContentLoaded", e);
      }
    }
    function i() {
      var e = document.querySelector('meta[name="htmx-config"]');
      if (e) {
        return v(e.content);
      } else {
        return null;
      }
    }
    function a() {
      var e = i();
      if (e) {
        Object.assign(r, e);
      }
    }
  }
  const S = Object.assign(b, {
    config: r,
    use(e) {
      e(S);
    },
    internals: {
      lexer: x,
      parser: g,
      runtime: k,
      Lexer: n,
      Tokens: i,
      Parser: a,
      Runtime: o,
    },
    ElementCollection: m,
    addFeature: g.addFeature.bind(g),
    addCommand: g.addCommand.bind(g),
    addLeafExpression: g.addLeafExpression.bind(g),
    addIndirectExpression: g.addIndirectExpression.bind(g),
    evaluate: k.evaluate.bind(k),
    parse: k.parse.bind(k),
    processNode: k.processNode.bind(k),
    version: "0.9.12",
    browserInit: w,
  });
  return S;
});
