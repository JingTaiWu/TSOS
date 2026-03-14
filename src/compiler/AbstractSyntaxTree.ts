import { Node } from './Node';

export class AbstractSyntaxTree {
  private currentNode: Node;
  private root: Node;
  private buffering: boolean = false;
  private buffer: string = "";

  public convert(node: Node): void {
    var character = /^([a-z])|(\s)$/;
    var isBranch = false;

    if (node.getName() === "Block") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "PrintStatement") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "AssignmentStatement") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "VarDecl") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "WhileStatement") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "IfStatement") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "StringExpr") {
      this.addNode(node, true); isBranch = true;
    } else if (node.getName() === "Id") {
      node.getChildren()[0].isIdentifier = true;
      this.addNode(node.getChildren()[0], false);
      isBranch = false;
    } else if (node.getName() === "int" || node.getName() === "string" || node.getName() === "boolean") {
      this.addNode(node, false);
      isBranch = false;
    } else if (node.getName() === "IntExpr") {
      if (node.getChildren().length === 1) {
        this.addNode(node.getChildren()[0], false);
      } else {
        var newNode = new Node("+");
        this.addNode(newNode, true);
        this.addNode(node.getChildren()[0], false);
      }
    } else if (character.test(node.getName()) && node.isChar) {
      this.buffer += node.getName();
      isBranch = false;
    } else if (node.getName() === "BooleanExpr") {
      if (node.getChildren().length === 1) {
        this.addNode(node.getChildren()[0], false);
        isBranch = false;
      } else {
        var nodeName = "";
        for (var i = 0; i < node.getChildren().length; i++) {
          if (node.getChildren()[i].getName() === "==") { nodeName = "=="; }
          else if (node.getChildren()[i].getName() === "!=") { nodeName = "!="; }
        }
        var newNode = new Node(nodeName);
        newNode.setLineNumber(node.getLineNumber());
        this.addNode(newNode, true);
        isBranch = true;
      }
    } else if (node.getName() === "\"") {
      this.buffering = !this.buffering;
      if (!this.buffering) {
        var newNode = new Node("\"" + this.buffer + "\"");
        newNode.setLineNumber(node.getLineNumber());
        this.buffer = "";
        this.addNode(newNode, false);
        isBranch = false;
      }
    }

    for (var i = 0; i < node.getChildren().length; i++) {
      this.convert(node.getChildren()[i]);
    }

    if (isBranch) {
      this.returnToParent();
    }
  }

  public addNode(node: Node, isBranch: boolean) {
    var newNode = new Node(node.getName());
    newNode.setLineNumber(node.getLineNumber());
    newNode.isIdentifier = node.isIdentifier;
    newNode.isChar = node.isChar;
    newNode.isBoolVal = node.isBoolVal;
    newNode.isDigit = node.isDigit;
    if (!this.root || this.root == null) {
      this.root = newNode;
      this.currentNode = newNode;
    } else {
      this.currentNode.addChild(newNode);
      newNode.setParentNode(this.currentNode);
    }

    if (isBranch) {
      this.currentNode = newNode;
    }
  }

  public getRootNode(): Node { return this.root; }

  public returnToParent(): void {
    if (this.currentNode === this.root) return;
    if (this.currentNode.getParentNode()) {
      this.currentNode = this.currentNode.getParentNode();
    }
  }
}
