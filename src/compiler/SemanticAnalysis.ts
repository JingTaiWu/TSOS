import { ConcreteSyntaxTree } from './ConcreteSyntaxTree';
import { AbstractSyntaxTree } from './AbstractSyntaxTree';
import { SymbolTable, ScopeNode } from './SymbolTable';
import type { CompilerLogEntry } from './types';

export class SemanticAnalysis {
  private CST: ConcreteSyntaxTree;
  private AST: AbstractSyntaxTree;
  public SymbolTable: SymbolTable;
  private logs: CompilerLogEntry[];

  constructor(CST: ConcreteSyntaxTree, logs: CompilerLogEntry[]) {
    this.CST = CST;
    this.logs = logs;
  }

  public getAST(): AbstractSyntaxTree { return this.AST; }

  public createAST(): void {
    this.AST = new AbstractSyntaxTree();
    this.AST.convert(this.CST.getRootNode());
  }

  public createSymbolTable(): void {
    this.SymbolTable = new SymbolTable();
    this.SymbolTable.create(this.AST.getRootNode());
  }

  public checkVariables(src: ScopeNode): void {
    for (var key in src.members) {
      var symbol = src.members[key];
      if (!symbol.isInitialized) {
        this.logs.push({
          level: 'warning',
          source: 'SEMANTIC_ANALYSIS',
          message: "Variable [ " + symbol.name + " ] in Scope [ " + symbol.scopeNumber + " ] was never initialized."
        });
      }
      if (!symbol.isUsed) {
        this.logs.push({
          level: 'warning',
          source: 'SEMANTIC_ANALYSIS',
          message: "Variable [ " + symbol.name + " ] in Scope [ " + symbol.scopeNumber + " ] was never used."
        });
      }
    }

    for (var i = 0; i < src.children.length; i++) {
      this.checkVariables(src.children[i]);
    }
  }
}
