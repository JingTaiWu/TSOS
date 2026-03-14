import { Node } from './Node';
import { SymbolTable, ScopeNode } from './SymbolTable';

export class Byte {
  public byte: string;
  public isTempVar: boolean = false;
  public isJumpVar: boolean = false;

  constructor(byte: string) {
    if (byte.length > 2) throw "Invalid Byte";
    if (byte.length < 2) byte = "0" + byte;
    this.byte = byte.toUpperCase();
  }
}

export class StaticVar {
  public tempName: string;
  public variable: string;
  public scope: number;
  public offset: number;

  constructor(count: number, variable: string, scope: number) {
    this.tempName = "T" + count;
    this.variable = variable;
    this.scope = scope;
    this.offset = count;
  }
}

export class JumpVar {
  public tempName: string;
  public distance: number;

  constructor(str: string) {
    this.tempName = str;
  }
}

export class StaticNode {
  public children: StaticNode[] = [];
  public parent: StaticNode;
  public members: Record<string, StaticVar> = {};
  public scopeNumber: number;
}

export class CodeGeneration {
  public ExecutableImage: Byte[];
  private ImageSize: number;
  private StaticTable: Record<string, StaticVar>;
  private StaticVarCount: number;
  private JumpTable: Record<string, JumpVar>;
  private JumpVarCount: number;
  private JumpOffset: number;
  private scopeNumber: number;
  private index: number;
  private heapIndex: number;
  private symbolTable: SymbolTable;
  private symbolArray: ScopeNode[];
  private curScopeNode: ScopeNode;
  private root: StaticNode;
  private currentNode: StaticNode;

  constructor(symbolTable: SymbolTable) {
    this.ExecutableImage = [];
    this.ImageSize = 256;
    this.StaticVarCount = 0;
    this.StaticTable = {};
    this.JumpTable = {};
    this.JumpOffset = 0;
    this.scopeNumber = 0;
    this.index = 0;
    this.heapIndex = 255;
    this.JumpVarCount = 0;
    this.symbolTable = symbolTable;
    this.symbolArray = [];
    this.tableToArray(this.symbolTable.getRoot());
  }

  public tableToArray(node: ScopeNode) {
    this.symbolArray.push(node);
    for (var i = 0; i < node.getChildren().length; i++) {
      this.tableToArray(node.getChildren()[i]);
    }
  }

  public addScope(scope: StaticNode): void {
    if (!this.root || this.root == null) {
      this.root = scope;
    } else {
      scope.parent = this.currentNode;
      this.currentNode.children.push(scope);
    }
    this.currentNode = scope;
  }

  public exitScope(): void {
    if (this.currentNode === this.root) return;
    if (this.currentNode.parent) {
      this.currentNode = this.currentNode.parent;
    }
  }

  public toExecutableImage(node: Node): void {
    var boolVal = ["true", "false"];
    for (var j = 0; j < boolVal.length; j++) {
      this.addByte(new Byte("00"), this.heapIndex, true);
      for (var i = boolVal[j].length - 1; i > -1; i--) {
        var hexVal = boolVal[j].charCodeAt(i).toString(16);
        this.addByte(new Byte(hexVal), this.heapIndex, true);
      }
    }

    this.toMachineCode(node);
    this.fill();
    this.replaceTemp();
  }

  public toMachineCode(node: Node): void {
    if (node.getName() === "Block") {
      this.scopeNumber++;
      this.JumpOffset = this.index;
      for (var i = 0; i < this.symbolArray.length; i++) {
        if (this.symbolArray[i].scopeNumber === this.scopeNumber) {
          this.curScopeNode = this.symbolArray[i];
        }
      }
      var newScope = new StaticNode();
      newScope.scopeNumber = this.scopeNumber;
      this.addScope(newScope);
    }

    if (node.getName() === "VarDecl") {
      var varName = node.getChildren()[1].getName();
      if (node.getChildren()[0].getName() === "int") {
        this.addToStaticTable(varName);
        this.LoadAccWithConst("0");
        this.StoreAccInMem(this.findStaticVar(varName));
      } else if (node.getChildren()[0].getName() === "string") {
        this.addToStaticTable(varName);
      } else if (node.getChildren()[0].getName() === "boolean") {
        this.addToStaticTable(varName);
        this.LoadAccWithConst((245).toString(16));
        this.StoreAccInMem(this.findStaticVar(varName));
      }
    }

    if (node.getName() === "AssignmentStatement") {
      var varName = node.getChildren()[0].getName();
      var varType = this.getType(varName, this.scopeNumber, this.symbolTable.getRoot());

      if (varType === "int") {
        if (node.getChildren()[1].getName() === "+") {
          this.LoadAccWithConst("00");
          this.StoreAccInMem("TS");
          this.generateIntExpr(node.getChildren()[1]);
          this.LoadAccFromMem("TS");
          this.StoreAccInMem(this.findStaticVar(varName));
        } else {
          var value = node.getChildren()[1].getName();
          this.LoadAccWithConst(value);
          this.StoreAccInMem(this.findStaticVar(varName));
        }
      } else if (varType === "string") {
        var str = node.getChildren()[1].getChildren()[0].getName();
        var memLocation = this.StoreStringToHeap(str);
        this.LoadAccWithConst(memLocation);
        this.StoreAccInMem(this.findStaticVar(varName));
      } else if (varType === "boolean") {
        var address = (node.getChildren()[1].getName() === "true") ? 251 : 245;
        var addressStr = address.toString(16);
        this.LoadAccWithConst(addressStr);
        this.StoreAccInMem(this.findStaticVar(varName));
      }
    }

    if (node.getName() === "PrintStatement") {
      if (node.getChildren()[0].getName().match(/^[a-z]$/g)) {
        var varName = node.getChildren()[0].getName();
        this.LoadYRegFromMem(this.findStaticVar(varName));
        var varType = this.getType(node.getChildren()[0].getName(), this.scopeNumber, this.symbolTable.getRoot());
        var constant = (varType === "int") ? "01" : "02";
        this.LoadXRegWithConst(constant);
      } else if (node.getChildren()[0].getName() === "StringExpr") {
        var strLit = node.getChildren()[0].getChildren()[0].getName();
        var memoryLocation = this.StoreStringToHeap(strLit);
        this.LoadYRegWithConst(memoryLocation);
        this.LoadXRegWithConst("02");
      }
      this.SystemCall();
    }

    if (node.getName() === "IfStatement") {
      if (node.getChildren()[0].getName() === "==") {
        this.generateEquality(node.getChildren()[0], "J" + (this.scopeNumber + 1));
      } else if (node.getChildren()[0].getName() === "!=") {
        this.generateInequality(node.getChildren()[0], "J" + (this.scopeNumber + 1));
      }
    }

    if (node.getName() === "WhileStatement") {
      var loopStartIndex = this.index;
      var jumpLabel = "J" + (this.scopeNumber + 1);
      var conditionNode = node.getChildren()[0];
      var loopBlockNode = node.getChildren()[1];
      if (conditionNode.getName() === "==") {
        this.generateEquality(conditionNode, jumpLabel);
      } else if (conditionNode.getName() === "!=") {
        this.generateInequality(conditionNode, jumpLabel);
      }

      if (loopBlockNode) {
        this.toMachineCode(loopBlockNode);
      }

      var indexBeforeLoopBack = this.index;
      this.generateLoopBackBranch(loopStartIndex);
      if (this.JumpTable[jumpLabel]) {
        this.JumpTable[jumpLabel].distance += (this.index - indexBeforeLoopBack);
      }
      return;
    }

    for (var i = 0; i < node.getChildren().length; i++) {
      this.toMachineCode(node.getChildren()[i]);
    }

    if (node.getName() === "Block") {
      if (this.JumpTable["J" + this.scopeNumber]) {
        this.JumpTable["J" + this.scopeNumber].distance = this.index - this.JumpOffset;
      }
      this.scopeNumber--;
      this.JumpOffset = 0;
      if (this.curScopeNode.parent) {
        this.curScopeNode = this.curScopeNode.parent;
      }
      this.exitScope();
    }
  }

  public addByte(byte: Byte, index: number, isAtHeap: boolean): void {
    if (index >= this.ImageSize) throw "Index exceeds maximum size of the executable image.";
    if (this.ExecutableImage[index] != null) throw "Out of Stack Space.";
    this.ExecutableImage[index] = byte;
    if (isAtHeap) { this.heapIndex--; } else { this.index++; }
  }

  public getType(varName: string, scopeNumber: number, node: ScopeNode): string {
    var retVal: string = null;
    var tempNode: ScopeNode = this.curScopeNode;
    while (!retVal || tempNode !== this.symbolTable.getRoot()) {
      if (tempNode) {
        if (tempNode.getSymbol(varName)) {
          retVal = tempNode.getSymbol(varName).type;
        }
      }
      if (tempNode.parent) {
        tempNode = tempNode.parent;
      }
    }
    return retVal;
  }

  public addToStaticTable(varName: string): void {
    var retVal = new StaticVar(this.StaticVarCount++, varName, this.scopeNumber);
    this.StaticTable[retVal.tempName] = retVal;
    this.currentNode.members[varName] = retVal;
  }

  public findStaticVar(varName: string): string {
    var retVal = null;
    var tempNode = this.currentNode;
    while (tempNode != null && tempNode != undefined) {
      retVal = tempNode.members[varName];
      if (retVal) break;
      tempNode = tempNode.parent;
    }
    retVal = tempNode.members[varName].tempName;
    return retVal;
  }

  public replaceTemp(): void {
    var newTempStaticVar = new StaticVar(this.StaticVarCount++, null, null);
    newTempStaticVar.tempName = "TT";
    this.StaticTable[newTempStaticVar.tempName] = newTempStaticVar;
    newTempStaticVar = new StaticVar(this.StaticVarCount++, null, null);
    newTempStaticVar.tempName = "TS";
    this.StaticTable[newTempStaticVar.tempName] = newTempStaticVar;

    for (var i = 0; i < this.ExecutableImage.length; i++) {
      var tempByte = this.ExecutableImage[i];
      if (tempByte.isTempVar) {
        var offset = this.StaticTable[tempByte.byte].offset + this.index + 1;
        if (offset > 255) throw "Index Out Of Bound";
        var offsetString = offset.toString(16).toUpperCase();
        offsetString = (offsetString.length < 2) ? "0" + offsetString : offsetString;
        tempByte.byte = offsetString;
      } else if (tempByte.isJumpVar) {
        var offsetString = this.JumpTable[tempByte.byte].distance.toString(16).toUpperCase();
        offsetString = (offsetString.length < 2) ? "0" + offsetString : offsetString;
        tempByte.byte = offsetString;
      }
    }
  }

  public fill(): void {
    for (var i = 0; i < this.ImageSize; i++) {
      if (!this.ExecutableImage[i]) {
        this.ExecutableImage[i] = new Byte("00");
      }
    }
  }

  // Assembly Instructions
  public StoreAccInMem(varName: string): void {
    this.addByte(new Byte("8D"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public LoadAccWithConst(constant: string): void {
    this.addByte(new Byte("A9"), this.index, false);
    this.addByte(new Byte(constant), this.index, false);
  }

  public LoadAccFromMem(varName: string): void {
    this.addByte(new Byte("AD"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public LoadYRegFromMem(varName: string): void {
    this.addByte(new Byte("AC"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public LoadXRegWithConst(constant: string): void {
    this.addByte(new Byte("A2"), this.index, false);
    this.addByte(new Byte(constant), this.index, false);
  }

  public LoadYRegWithConst(constant: string): void {
    this.addByte(new Byte("A0"), this.index, false);
    this.addByte(new Byte(constant), this.index, false);
  }

  public LoadXRegFromMem(varName: string): void {
    this.addByte(new Byte("AE"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public BranchNotEqual(jumpLabel?: string): void {
    this.addByte(new Byte("D0"), this.index, false);
    var label = jumpLabel || ("J" + this.scopeNumber);
    var jumpTemp = new JumpVar(label);
    var tempByte = new Byte(jumpTemp.tempName); tempByte.isJumpVar = true;
    this.JumpTable[jumpTemp.tempName] = jumpTemp;
    this.addByte(tempByte, this.index, false);
  }

  public BranchEqual(jumpLabel?: string): void {
    this.addByte(new Byte("F0"), this.index, false);
    var label = jumpLabel || ("J" + this.scopeNumber);
    var jumpTemp = new JumpVar(label);
    var tempByte = new Byte(jumpTemp.tempName); tempByte.isJumpVar = true;
    this.JumpTable[jumpTemp.tempName] = jumpTemp;
    this.addByte(tempByte, this.index, false);
  }

  public CompareMemoryToXReg(varName: string): void {
    this.addByte(new Byte("EC"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public AddWithCarry(varName: string): void {
    this.addByte(new Byte("6D"), this.index, false);
    var tempByte = new Byte(varName); tempByte.isTempVar = true;
    this.addByte(tempByte, this.index, false);
    this.addByte(new Byte("00"), this.index, false);
  }

  public SystemCall(): void {
    this.addByte(new Byte("FF"), this.index, false);
  }

  public StoreStringToHeap(str: string): string {
    str = str.substring(1, str.length - 1);
    this.addByte(new Byte("00"), this.heapIndex, true);
    for (var i = str.length - 1; i > -1; i--) {
      var hexVal = str.charCodeAt(i).toString(16);
      this.addByte(new Byte(hexVal), this.heapIndex, true);
    }
    return (this.heapIndex + 1).toString(16);
  }

  public generateEquality(node: Node, jumpLabel?: string): void {
    var firstOperand = node.getChildren()[0];
    var secondOperand = node.getChildren()[1];
    if (firstOperand.getName() === "==" || secondOperand.getName() === "!=") {
      throw "Nested boolean expr is not supported yet.";
    } else if (firstOperand.getName() === "StringExpr" && secondOperand.getName() === "StringExpr") {
      var firstStr = firstOperand.getChildren()[0].getName();
      var secondStr = secondOperand.getChildren()[0].getName();
      if (firstStr === secondStr) { this.LoadXRegWithConst("01"); } else { this.LoadXRegWithConst("02"); }
      this.LoadAccWithConst("01"); this.StoreAccInMem("TT");
      this.CompareMemoryToXReg("TT"); this.BranchNotEqual(jumpLabel);
    } else if (firstOperand.getName() === "StringExpr" || secondOperand.getName() === "StringExpr") {
      throw "ID to String comparison is not supported yet.";
    } else {
      if (firstOperand.getName().match(/^[0-9]$/g) && secondOperand.getName().match(/^[0-9]$/g)) {
        this.LoadXRegWithConst(firstOperand.getName());
        this.LoadAccWithConst(secondOperand.getName());
        this.StoreAccInMem("TT"); this.CompareMemoryToXReg("TT"); this.BranchNotEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^[a-z]$/g) && secondOperand.getName().match(/^[a-z]$/g)) {
        this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        this.CompareMemoryToXReg(this.findStaticVar(secondOperand.getName()));
        this.BranchNotEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^((true)|(false))$/g) || secondOperand.getName().match(/^((true)|(false))$/g)) {
        if (firstOperand.getName().match(/^((true)|(false))$/g)) {
          this.LoadAccWithConst(firstOperand.getName() === "true" ? "FB" : "F5");
        } else {
          this.LoadAccWithConst(secondOperand.getName() === "true" ? "FB" : "F5");
        }
        this.StoreAccInMem("TT");
        if (firstOperand.getName().match(/^[a-z]$/g)) {
          this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        } else {
          this.LoadXRegFromMem(this.findStaticVar(secondOperand.getName()));
        }
        this.CompareMemoryToXReg("TT"); this.BranchNotEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^[0-9]$/g) || secondOperand.getName().match(/^[0-9]$/g)) {
        if (firstOperand.getName().match(/^[a-z]$/g)) {
          this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        } else {
          this.LoadXRegFromMem(this.findStaticVar(secondOperand.getName()));
        }
        if (firstOperand.getName().match(/^[0-9]$/g)) {
          this.LoadAccWithConst(firstOperand.getName());
        } else {
          this.LoadAccWithConst(secondOperand.getName());
        }
        this.StoreAccInMem("TT"); this.CompareMemoryToXReg("TT"); this.BranchNotEqual(jumpLabel);
      }
    }
  }

  public generateLoopBackBranch(loopStartIndex: number): void {
    this.LoadXRegWithConst("01");
    this.LoadAccWithConst("00");
    this.StoreAccInMem("TT");
    this.CompareMemoryToXReg("TT");
    var branchInstructionSize = 2;
    var distance = this.index + branchInstructionSize - loopStartIndex;
    var offset = 256 - distance;
    var offsetString = offset.toString(16).toUpperCase();
    offsetString = (offsetString.length < 2) ? "0" + offsetString : offsetString;
    this.addByte(new Byte("D0"), this.index, false);
    this.addByte(new Byte(offsetString), this.index, false);
  }

  public generateInequality(node: Node, jumpLabel?: string): void {
    var firstOperand = node.getChildren()[0];
    var secondOperand = node.getChildren()[1];
    if (firstOperand.getName() === "==" || secondOperand.getName() === "!=") {
      throw "Nested boolean expr is not supported yet.";
    } else if (firstOperand.getName() === "StringExpr" && secondOperand.getName() === "StringExpr") {
      var firstStr = firstOperand.getChildren()[0].getName();
      var secondStr = secondOperand.getChildren()[0].getName();
      if (firstStr === secondStr) { this.LoadXRegWithConst("01"); } else { this.LoadXRegWithConst("02"); }
      this.LoadAccWithConst("01"); this.StoreAccInMem("TT");
      this.CompareMemoryToXReg("TT"); this.BranchEqual(jumpLabel);
    } else if (firstOperand.getName() === "StringExpr" || secondOperand.getName() === "StringExpr") {
      throw "ID to String comparison is not supported yet.";
    } else {
      if (firstOperand.getName().match(/^[0-9]$/g) && secondOperand.getName().match(/^[0-9]$/g)) {
        this.LoadXRegWithConst(firstOperand.getName());
        this.LoadAccWithConst(secondOperand.getName());
        this.StoreAccInMem("TT"); this.CompareMemoryToXReg("TT"); this.BranchEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^[a-z]$/g) && secondOperand.getName().match(/^[a-z]$/g)) {
        this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        this.CompareMemoryToXReg(this.findStaticVar(secondOperand.getName()));
        this.BranchEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^((true)|(false))$/g) || secondOperand.getName().match(/^((true)|(false))$/g)) {
        if (firstOperand.getName().match(/^((true)|(false))$/g)) {
          this.LoadAccWithConst(firstOperand.getName() === "true" ? "FB" : "F5");
        } else {
          this.LoadAccWithConst(secondOperand.getName() === "true" ? "FB" : "F5");
        }
        this.StoreAccInMem("TT");
        if (firstOperand.getName().match(/^[a-z]$/g)) {
          this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        } else {
          this.LoadXRegFromMem(this.findStaticVar(secondOperand.getName()));
        }
        this.CompareMemoryToXReg("TT"); this.BranchEqual(jumpLabel);
      } else if (firstOperand.getName().match(/^[0-9]$/g) || secondOperand.getName().match(/^[0-9]$/g)) {
        if (firstOperand.getName().match(/^[a-z]$/g)) {
          this.LoadXRegFromMem(this.findStaticVar(firstOperand.getName()));
        } else {
          this.LoadXRegFromMem(this.findStaticVar(secondOperand.getName()));
        }
        if (firstOperand.getName().match(/^[0-9]$/g)) {
          this.LoadAccWithConst(firstOperand.getName());
        } else {
          this.LoadAccWithConst(secondOperand.getName());
        }
        this.StoreAccInMem("TT"); this.CompareMemoryToXReg("TT"); this.BranchEqual(jumpLabel);
      }
    }
  }

  public generateIntExpr(node: Node): void {
    var firstOperand = node.getChildren()[0];
    var secondOperand = node.getChildren()[1];
    if (secondOperand.getName() === "+") {
      this.generateIntExpr(secondOperand);
    } else {
      if (firstOperand.getName().match(/^[a-z]$/g)) {
        this.LoadAccFromMem(this.findStaticVar(firstOperand.getName()));
      } else {
        this.LoadAccWithConst(firstOperand.getName());
      }
      if (secondOperand.getName().match(/^[a-z]$/g)) {
        this.AddWithCarry(this.findStaticVar(secondOperand.getName()));
      } else {
        this.StoreAccInMem("TT");
        this.LoadAccWithConst(secondOperand.getName());
        this.AddWithCarry("TT");
      }
      this.AddWithCarry("TS");
      this.StoreAccInMem("TS");
    }
  }
}
