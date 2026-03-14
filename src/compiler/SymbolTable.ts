import { Node } from './Node';

export class CompilerSymbol {
  public type: string;
  public name: string;
  public lineNumber: number;
  public scopeNumber: number;
  public isUsed: boolean = false;
  public isInitialized: boolean = false;
}

export class ScopeNode {
  public scopeNumber: number;
  public members: Record<string, CompilerSymbol> = {};
  public parent: ScopeNode;
  public children: ScopeNode[] = [];

  public addSymbol(sym: CompilerSymbol): void {
    this.members[sym.name] = sym;
  }

  public addNode(node: ScopeNode): void {
    this.children.push(node);
  }

  public getSymbol(id: string): CompilerSymbol | undefined {
    return this.members[id];
  }

  public getChildren(): ScopeNode[] {
    return this.children;
  }
}

export class SymbolTable {
  private scopeNum: number = 0;
  public root: ScopeNode;
  private currentNode: ScopeNode;

  public create(node: Node): void {
    if (node.getName() === "Block") {
      var newScope = new ScopeNode();
      newScope.scopeNumber = ++this.scopeNum;
      this.addScope(newScope);
    }

    if (node.getName() === "VarDecl") {
      var varName = node.getChildren()[1].getName();
      if (this.currentNode.getSymbol(varName)) {
        throw "Variable " + varName + " on line " + node.getChildren()[1].getLineNumber() + " is already declared!";
      }
      var symbol = new CompilerSymbol();
      symbol.type = node.getChildren()[0].getName();
      symbol.name = varName;
      symbol.lineNumber = node.getChildren()[1].getLineNumber();
      symbol.scopeNumber = this.currentNode.scopeNumber;
      this.currentNode.addSymbol(symbol);
    }

    if (node.getName() === "AssignmentStatement") {
      var id: string = node.getChildren()[0].getName();
      var idSymbol = this.findId(id);

      if (!idSymbol) {
        throw "Undeclared Variable " + id + " on line " + node.getChildren()[0].getLineNumber() + ".";
      } else {
        var idType: string = idSymbol.type;
        var assignedType: string;
        if (node.getChildren()[1].isIdentifier) {
          var tempSymbol = this.findId(node.getChildren()[1].getName());
          if (!tempSymbol) {
            throw "Undeclared Variable " + node.getChildren()[1].getName() + " on line " + node.getChildren()[0].getLineNumber() + ".";
          } else {
            assignedType = tempSymbol.type;
          }
        } else {
          assignedType = node.getChildren()[1].getName();
        }

        var errStr = "Type Mismatch: variable [" + id + "] on line " + node.getChildren()[0].getLineNumber() + ".";
        if (idType === "string") {
          if (assignedType !== "StringExpr" && assignedType !== "string") throw errStr;
        } else if (idType === "boolean") {
          if (assignedType !== "true" && assignedType !== "false" && assignedType !== "==" && assignedType !== "!=" && assignedType !== "boolean") throw errStr;
        } else if (idType === "int") {
          var digit = /^[0-9]$/;
          if (assignedType !== "+" && !digit.test(assignedType) && assignedType !== "int") throw errStr;
        }

        idSymbol.isInitialized = true;
      }
    }

    if (node.getName() === "+") {
      var child = node.getChildren()[1];
      if (child.isIdentifier) {
        var symbol = this.findId(child.getName());
        if (symbol) {
          if (symbol.type === "int") {
            symbol.isUsed = true;
          } else {
            throw "Type Mismatch: variable [" + child.getName() + "] on line " + child.getLineNumber() + ".";
          }
        } else {
          throw "Undeclared Variable " + child.getName() + " on line " + child.getLineNumber() + ".";
        }
      } else if (child.getName() !== "+" && !child.isDigit) {
        throw "Type Mismatch: variable [" + child.getName() + "] on line " + child.getLineNumber() + ".";
      }
    }

    if (node.getName() === "==" || node.getName() === "!=") {
      var first = node.getChildren()[0];
      var second = node.getChildren()[1];
      var firstType = first.getName();
      var secondType = second.getName();
      var boolval = /^((false)|(true))$/;
      var digit = /^[0-9]$/;
      var boolop = /^((==)|(!=))$/;

      if (boolval.test(firstType) || boolop.test(firstType)) firstType = "boolean";
      if (boolval.test(secondType) || boolop.test(secondType)) secondType = "boolean";
      if (digit.test(firstType)) firstType = "int";
      if (digit.test(secondType)) secondType = "int";

      if (first.isIdentifier) {
        var symbol = this.findId(first.getName());
        if (symbol) {
          firstType = (symbol.type === "string") ? "StringExpr" : symbol.type;
          symbol.isUsed = true;
        } else {
          throw "Undeclared Variable " + first.getName() + " on line " + first.getLineNumber() + ".";
        }
      }

      if (second.isIdentifier) {
        var symbol = this.findId(second.getName());
        if (symbol) {
          secondType = (symbol.type === "string") ? "StringExpr" : symbol.type;
          symbol.isUsed = true;
        } else {
          throw "Undeclared Variable " + second.getName() + " on line " + second.getLineNumber() + ".";
        }
      }

      if (firstType !== secondType) {
        throw "Type Mismatch between [" + first.getName() + "] and [" + second.getName() + "] on line " + first.getLineNumber() + ".";
      }
    }

    if (node.getName() === "PrintStatement") {
      if (node.getChildren().length === 1) {
        var child = node.getChildren()[0];
        if (child.isIdentifier) {
          var symbol = this.findId(child.getName());
          if (!symbol) {
            throw "Undeclared Variable " + child.getName() + " on line " + child.getLineNumber() + ".";
          } else {
            symbol.isUsed = true;
          }
        }
      }
    }

    for (var i = 0; i < node.getChildren().length; i++) {
      this.create(node.getChildren()[i]);
    }

    if (node.getName() === "Block") {
      this.exitScope();
    }
  }

  public findId(id: string): CompilerSymbol | undefined {
    var curScope: ScopeNode | undefined = this.currentNode;
    var retVal: CompilerSymbol | undefined;
    while (curScope != null && curScope != undefined) {
      retVal = curScope.getSymbol(id);
      if (retVal) break;
      curScope = curScope.parent;
    }
    return retVal;
  }

  public addScope(scope: ScopeNode): void {
    if (!this.root || this.root == null) {
      this.root = scope;
    } else {
      scope.parent = this.currentNode;
      this.currentNode.addNode(scope);
    }
    this.currentNode = scope;
  }

  public exitScope(): void {
    if (this.currentNode === this.root) return;
    if (this.currentNode.parent) {
      this.currentNode = this.currentNode.parent;
    }
  }

  public getRoot(): ScopeNode { return this.root; }
}
