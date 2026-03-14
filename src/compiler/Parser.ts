import { Token } from './Token';
import { Node } from './Node';
import { ConcreteSyntaxTree } from './ConcreteSyntaxTree';
import type { CompilerLogEntry } from './types';

export class Parser {
  private tokenStream: Token[];
  private index: number;
  private currentToken: Token;
  private errorCount: number;
  private CST: ConcreteSyntaxTree;
  private logs: CompilerLogEntry[];
  private isVerbose: boolean;

  constructor(tokenStream: Token[], logs: CompilerLogEntry[], isVerbose: boolean) {
    this.tokenStream = tokenStream;
    this.index = 0;
    this.errorCount = 0;
    this.CST = new ConcreteSyntaxTree();
    this.logs = logs;
    this.isVerbose = isVerbose;
  }

  public parse(): boolean {
    this.currentToken = this.getNextToken();
    this.stdOut("Begin Parsing...");
    this.parseProgram();
    return true;
  }

  public parseProgram(): void {
    this.stdOut("Parsing a program.");
    var newNode = new Node("Program");
    this.CST.addNode(newNode, "BRANCH");
    this.parseBlock();
    this.checkToken("EOF_TOKEN");
  }

  public parseBlock(): void {
    this.stdOut("Parsing a Block");
    this.CST.addNode(new Node("Block"), "BRANCH");
    this.checkToken("OPEN_BRACE_TOKEN");
    this.parseStatementList();
    this.checkToken("CLOSE_BRACE_TOKEN");
    this.CST.returnToParent();
  }

  public parseStatementList(): void {
    this.stdOut("Parsing a StatementList.");
    this.CST.addNode(new Node("StatementList"), "BRANCH");
    if (this.currentToken.getKind() === "PRINT_KEYWORD_TOKEN" ||
        this.currentToken.getKind() === "IDENTIFIER_TOKEN" ||
        this.currentToken.getKind() === "TYPE_TOKEN" ||
        this.currentToken.getKind() === "WHILE_KEYWORD_TOKEN" ||
        this.currentToken.getKind() === "IF_KEYWORD_TOKEN" ||
        this.currentToken.getKind() === "OPEN_BRACE_TOKEN") {
      this.parseStatement();
      this.parseStatementList();
    }
    this.CST.returnToParent();
  }

  public parseStatement(): void {
    this.stdOut("Parsing a Statement.");
    this.CST.addNode(new Node("Statement"), "BRANCH");
    if (this.currentToken.getKind() === "PRINT_KEYWORD_TOKEN") {
      this.parsePrintStatement();
    } else if (this.currentToken.getKind() === "IDENTIFIER_TOKEN") {
      this.parseAssignmentStatement();
    } else if (this.currentToken.getKind() === "TYPE_TOKEN") {
      this.parseVarDecl();
    } else if (this.currentToken.getKind() === "WHILE_KEYWORD_TOKEN") {
      this.parseWhileStatement();
    } else if (this.currentToken.getKind() === "IF_KEYWORD_TOKEN") {
      this.parseIfStatement();
    } else {
      this.parseBlock();
    }
    this.CST.returnToParent();
  }

  public parsePrintStatement(): void {
    this.stdOut("Parsing a PrintStatement.");
    this.CST.addNode(new Node("PrintStatement"), "BRANCH");
    this.checkToken("PRINT_KEYWORD_TOKEN");
    this.checkToken("OPEN_PARENTHESIS_TOKEN");
    this.parseExpr();
    this.checkToken("CLOSE_PARENTHESIS_TOKEN");
    this.CST.returnToParent();
  }

  public parseAssignmentStatement(): void {
    this.stdOut("Parsing an AssignmentStatement.");
    this.CST.addNode(new Node("AssignmentStatement"), "BRANCH");
    this.parseId();
    this.checkToken("ASSIGN_OP_TOKEN");
    this.parseExpr();
    this.CST.returnToParent();
  }

  public parseVarDecl(): void {
    this.stdOut("Parsing VarDeclaration.");
    this.CST.addNode(new Node("VarDecl"), "BRANCH");
    this.checkToken("TYPE_TOKEN");
    this.parseId();
    this.CST.returnToParent();
  }

  public parseWhileStatement(): void {
    this.stdOut("Parsing WhileStatement");
    this.CST.addNode(new Node("WhileStatement"), "BRANCH");
    this.checkToken("WHILE_KEYWORD_TOKEN");
    this.parseBooleanExpr();
    this.parseBlock();
    this.CST.returnToParent();
  }

  public parseIfStatement(): void {
    this.stdOut("Parsing IfStatement.");
    this.CST.addNode(new Node("IfStatement"), "BRANCH");
    this.checkToken("IF_KEYWORD_TOKEN");
    this.parseBooleanExpr();
    this.parseBlock();
    this.CST.returnToParent();
  }

  public parseExpr(): void {
    this.stdOut("Parsing an ExpressionStatement.");
    this.CST.addNode(new Node("Expr"), "BRANCH");
    if (this.currentToken.getKind() === "DIGIT_TOKEN") {
      this.parseIntExpr();
    } else if (this.currentToken.getKind() === "QUOTATION_TOKEN") {
      this.parseStringExpr();
    } else if (this.currentToken.getKind() === "BOOL_VAL_TOKEN" ||
               this.currentToken.getKind() === "OPEN_PARENTHESIS_TOKEN") {
      this.parseBooleanExpr();
    } else {
      this.parseId();
    }
    this.CST.returnToParent();
  }

  public parseIntExpr(): void {
    var nextToken = this.tokenStream[this.index];
    this.CST.addNode(new Node("IntExpr"), "BRANCH");
    if (nextToken.getKind() === "INT_OP_TOKEN") {
      this.stdOut("Parsing an IntegerStatement (digit intop expr).");
      this.checkToken("DIGIT_TOKEN");
      this.checkToken("INT_OP_TOKEN");
      this.parseExpr();
    } else {
      this.stdOut("Parsing an IntegerStatement (digit).");
      this.checkToken("DIGIT_TOKEN");
    }
    this.CST.returnToParent();
  }

  public parseStringExpr(): void {
    this.stdOut("Parsing a StringExpression.");
    this.CST.addNode(new Node("StringExpr"), "BRANCH");
    this.checkToken("QUOTATION_TOKEN");
    this.parseCharList();
    this.checkToken("QUOTATION_TOKEN");
    this.CST.returnToParent();
  }

  public parseBooleanExpr(): void {
    this.stdOut("Parse a BooleanExpression.");
    this.CST.addNode(new Node("BooleanExpr"), "BRANCH");
    if (this.currentToken.getKind() === "OPEN_PARENTHESIS_TOKEN") {
      this.checkToken("OPEN_PARENTHESIS_TOKEN");
      this.parseExpr();
      this.checkToken("BOOL_OP_TOKEN");
      this.parseExpr();
      this.checkToken("CLOSE_PARENTHESIS_TOKEN");
    } else {
      this.checkToken("BOOL_VAL_TOKEN");
    }
    this.CST.returnToParent();
  }

  public parseId(): void {
    this.stdOut("Parsing an ID.");
    this.CST.addNode(new Node("Id"), "BRANCH");
    this.checkToken("IDENTIFIER_TOKEN");
    this.CST.returnToParent();
  }

  public parseCharList(): void {
    this.stdOut("Parsing a CharList.");
    this.CST.addNode(new Node("CharList"), "BRANCH");
    if (this.currentToken.getKind() === "CHARACTER_TOKEN") {
      this.checkToken("CHARACTER_TOKEN");
      this.parseCharList();
    } else if (this.currentToken.getKind() === "SPACE_TOKEN") {
      this.checkToken("SPACE_TOKEN");
      this.parseCharList();
    }
    this.CST.returnToParent();
  }

  public checkToken(expectedKind: string): boolean {
    if (this.currentToken.getKind() === expectedKind) {
      this.stdOut("Expecting [ " + expectedKind + " ]. Found [ " + this.currentToken.getValue() + " ].");
      var newNode = new Node(this.currentToken.getValue());
      newNode.setLineNumber(this.currentToken.getLineNumber());
      if (this.currentToken.getKind() === "CHARACTER_TOKEN" || this.currentToken.getKind() === "SPACE_TOKEN") {
        newNode.isChar = true;
      }
      if (this.currentToken.getKind() === "IDENTIFIER_TOKEN") {
        newNode.isIdentifier = true;
      }
      if (this.currentToken.getKind() === "DIGIT_TOKEN") {
        newNode.isDigit = true;
      }
      if (this.currentToken.getKind() === "BOOL_VAL_TOKEN") {
        newNode.isBoolVal = true;
      }
      this.CST.addNode(newNode, "LEAF");
      this.currentToken = this.getNextToken();
      return true;
    } else {
      var errStr = "Expecting [ " + expectedKind + " ]. Found [ " + this.currentToken.getValue()
                    + " ]. On line " + this.currentToken.getLineNumber();
      this.errorCount++;
      throw errStr;
    }
  }

  public getNextToken(): Token {
    var thisToken = new Token("", "", 0);
    if (this.index < this.tokenStream.length) {
      thisToken = this.tokenStream[this.index];
      this.index++;
    }
    return thisToken;
  }

  public peek(): Token {
    var nextIndex = this.index + 1;
    var thisToken = new Token("", "", 0);
    if (nextIndex < this.tokenStream.length) {
      thisToken = this.tokenStream[nextIndex];
    }
    return thisToken;
  }

  private stdOut(msg: string): void {
    if (this.isVerbose) {
      this.logs.push({ level: 'info', source: 'PARSER', message: msg });
    }
  }

  public getCST(): ConcreteSyntaxTree { return this.CST; }
}
