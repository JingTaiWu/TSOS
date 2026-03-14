import { Node } from './Node';

export class ConcreteSyntaxTree {
  private root: Node;
  private curNode: Node;

  public addNode(newNode: Node, nodeKind: string): void {
    if (this.root == null || (!this.root)) {
      this.root = newNode;
      this.curNode = newNode;
    } else {
      newNode.setParentNode(this.curNode);
      this.curNode.addChild(newNode);
    }

    if (nodeKind === "BRANCH") {
      this.curNode = newNode;
    }
  }

  public returnToParent(): void {
    if (this.curNode.getParentNode()) {
      this.curNode = this.curNode.getParentNode();
    }
  }

  public getRootNode(): Node { return this.root; }

  public toString(): string {
    var result = "";
    function expand(node: Node, depth: number) {
      for (var i = 0; i < depth; i++) { result += "-"; }
      var children = node.getChildren();
      if (!children || children.length === 0) {
        result += "[" + node.getName() + "]\n";
      } else {
        result += "<" + node.getName() + "> \n";
        for (var j = 0; j < children.length; j++) {
          expand(children[j], depth + 1);
        }
      }
    }
    expand(this.root, 0);
    return result;
  }
}
