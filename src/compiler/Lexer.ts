import { Token } from './Token';
import type { CompilerLogEntry } from './types';

export class Lexer {
  private input: string;
  private stringMode: boolean;
  private tokens: Token[];
  private logs: CompilerLogEntry[];

  constructor(input: string, logs: CompilerLogEntry[]) {
    this.input = input.trim();
    this.stringMode = false;
    this.tokens = [];
    this.logs = logs;
  }

  public toTokens(isVerbose: boolean): boolean {
    var DELIMITER = /([a-z]+)|(\d)|("[^"]*")|(==)|(!=)|(\S)/g;

    if (this.input === "") {
      throw "Please put some code in.";
    }

    if (this.input.charAt(this.input.length - 1) !== "$") {
      this.log('warning', "Did not detect EOF at the end of the code, appending EOF.");
      this.input += "$";
    }

    if (isVerbose) this.log('info', "Processing the code...");

    var lines: string[] = this.input.trim().split("\n");

    for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      var line = lines[lineNumber];
      if (line) {
        var words = line.match(DELIMITER);
        if (words) {
          for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var result = this.matchToken(word, lineNumber + 1);

            if (result) {
              if (result.getKind() === "STRING_TOKEN") {
                var str = result.getValue();
                for (var j = 0; j < str.length; j++) {
                  var curChar = str[j];
                  var character = /^[a-z]$/;
                  if (curChar === "\"") {
                    this.tokens.push(new Token("QUOTATION_TOKEN", curChar, lineNumber + 1));
                  } else if (curChar === " ") {
                    this.tokens.push(new Token("SPACE_TOKEN", curChar, lineNumber + 1));
                  } else if (character.test(curChar)) {
                    this.tokens.push(new Token("CHARACTER_TOKEN", curChar, lineNumber + 1));
                  } else {
                    throw "Invalid String Character: " + curChar + " on line " + (lineNumber + 1) + ".";
                  }
                }
              } else if (result.getKind() === "EOF_TOKEN") {
                this.tokens.push(result);
                if (lineNumber < lines.length - 1 || i < words.length - 1) {
                  this.log('warning', "EOF Token detected and there are more code. The rest of the code will be ignored.");
                }
                return true;
              } else {
                this.tokens.push(result);
              }
            } else {
              throw "Invalid Token: " + word + " on line " + (lineNumber + 1) + ".";
            }
          }
        }
      }
    }

    this.log('success', "No LEX errors found.");
    return true;
  }

  public matchToken(pattern: string, lineNumber: number): Token | null {
    var type_int = /^int$/;
    var type_string = /^string$/;
    var type_boolean = /^boolean$/;
    var character = /^[a-z]$/;
    var digit = /^[0-9]$/;
    var boolop = /^((==)|(!=))$/;
    var boolval = /^((false)|(true))$/;
    var intop = /^\+$/;
    var openBrace = /^\{$/;
    var closeBrace = /^\}$/;
    var printKeyword = /^print$/;
    var whileKeyword = /^while$/;
    var ifKeyword = /^if$/;
    var assign = /^=$/;
    var openParent = /^\($/;
    var closeParent = /^\)$/;
    var EOF = /^\$$/;
    var quotation = /"/;
    var space = /^\s$/;
    var str = /^("[^"]*")$/;

    if (type_boolean.test(pattern) || type_string.test(pattern) || type_int.test(pattern)) {
      return new Token("TYPE_TOKEN", pattern, lineNumber);
    } else if (character.test(pattern)) {
      return new Token("IDENTIFIER_TOKEN", pattern, lineNumber);
    } else if (digit.test(pattern)) {
      return new Token("DIGIT_TOKEN", pattern, lineNumber);
    } else if (boolop.test(pattern)) {
      return new Token("BOOL_OP_TOKEN", pattern, lineNumber);
    } else if (boolval.test(pattern)) {
      return new Token("BOOL_VAL_TOKEN", pattern, lineNumber);
    } else if (intop.test(pattern)) {
      return new Token("INT_OP_TOKEN", pattern, lineNumber);
    } else if (openBrace.test(pattern)) {
      return new Token("OPEN_BRACE_TOKEN", pattern, lineNumber);
    } else if (closeBrace.test(pattern)) {
      return new Token("CLOSE_BRACE_TOKEN", pattern, lineNumber);
    } else if (printKeyword.test(pattern)) {
      return new Token("PRINT_KEYWORD_TOKEN", pattern, lineNumber);
    } else if (whileKeyword.test(pattern)) {
      return new Token("WHILE_KEYWORD_TOKEN", pattern, lineNumber);
    } else if (ifKeyword.test(pattern)) {
      return new Token("IF_KEYWORD_TOKEN", pattern, lineNumber);
    } else if (assign.test(pattern)) {
      return new Token("ASSIGN_OP_TOKEN", pattern, lineNumber);
    } else if (openParent.test(pattern)) {
      return new Token("OPEN_PARENTHESIS_TOKEN", pattern, lineNumber);
    } else if (closeParent.test(pattern)) {
      return new Token("CLOSE_PARENTHESIS_TOKEN", pattern, lineNumber);
    } else if (EOF.test(pattern)) {
      return new Token("EOF_TOKEN", pattern, lineNumber);
    } else if (space.test(pattern)) {
      return new Token("SPACE_TOKEN", pattern, lineNumber);
    } else if (str.test(pattern)) {
      return new Token("STRING_TOKEN", pattern, lineNumber);
    } else if (quotation.test(pattern)) {
      this.stringMode = !this.stringMode;
      return new Token("QUOTATION_TOKEN", pattern, lineNumber);
    } else {
      return null;
    }
  }

  private log(level: CompilerLogEntry['level'], message: string): void {
    this.logs.push({ level, source: 'LEXER', message });
  }

  public getTokens(): Token[] { return this.tokens; }
}
