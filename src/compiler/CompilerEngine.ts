import { Lexer } from './Lexer';
import { Parser } from './Parser';
import { SemanticAnalysis } from './SemanticAnalysis';
import { CodeGeneration } from './CodeGen';
import type { CompilerLogEntry, CompilationResult } from './types';
import type { Node } from './Node';
import type { ScopeNode } from './SymbolTable';

export class CompilerEngine {
  verbose = true;
  lastResult: CompilationResult | null = null;

  private updateListeners: Set<() => void> = new Set();

  onUpdate(listener: () => void) {
    this.updateListeners.add(listener);
    return () => { this.updateListeners.delete(listener); };
  }

  emitUpdate() {
    for (const fn of this.updateListeners) fn();
  }

  compile(source: string): CompilationResult {
    const logs: CompilerLogEntry[] = [];
    const result: CompilationResult = {
      success: false,
      hexOutput: '',
      tokens: [],
      cstRoot: null,
      astRoot: null,
      symbolTable: null,
      logs,
    };

    let passLexer = false;
    let passParser = false;
    let passSemanticAnalysis = false;

    // Phase 1: Lexer
    try {
      const lexer = new Lexer(source, logs);
      passLexer = lexer.toTokens(this.verbose);
      logs.push({ level: 'success', source: 'LEXER', message: 'Lexer found no errors.' });

      result.tokens = lexer.getTokens().map((t, i) => ({
        index: i + 1,
        kind: t.getKind(),
        value: t.getValue(),
      }));

      // Phase 2: Parser
      if (passLexer) {
        try {
          const parser = new Parser(lexer.getTokens(), logs, this.verbose);
          passParser = parser.parse();
          logs.push({ level: 'success', source: 'PARSER', message: 'Parser found no errors.' });

          const cst = parser.getCST();
          result.cstRoot = this.serializeTree(cst.getRootNode());

          // Phase 3: Semantic Analysis
          if (passParser) {
            try {
              const semantic = new SemanticAnalysis(cst, logs);
              semantic.createAST();
              semantic.createSymbolTable();
              logs.push({ level: 'success', source: 'SEMANTIC ANALYSIS', message: 'Semantic analyzer found no errors.' });
              semantic.checkVariables(semantic.SymbolTable.root);

              result.astRoot = this.serializeTree(semantic.getAST().getRootNode());
              result.symbolTable = this.serializeSymbolTable(semantic.SymbolTable.root);
              passSemanticAnalysis = true;

              // Phase 4: Code Generation
              if (passSemanticAnalysis) {
                try {
                  const codeGen = new CodeGeneration(semantic.SymbolTable);
                  codeGen.toExecutableImage(semantic.getAST().getRootNode());
                  result.hexOutput = codeGen.ExecutableImage.map(b => b.byte).join(' ');
                  result.success = true;
                } catch (e) {
                  logs.push({ level: 'error', source: 'CODE_GENERATION', message: String(e) });
                }
              }
            } catch (e) {
              logs.push({ level: 'error', source: 'SEMANTIC_ANALYSIS', message: String(e) });
            }
          }
        } catch (e) {
          logs.push({ level: 'error', source: 'PARSER', message: String(e) });
        }
      }
    } catch (e) {
      logs.push({ level: 'error', source: 'LEXER', message: String(e) });
    }

    this.lastResult = result;
    this.emitUpdate();
    return result;
  }

  private serializeTree(node: Node): any {
    if (!node) return null;
    const children = node.getChildren();
    return {
      name: node.getName(),
      isLeaf: children.length === 0,
      children: children.map(c => this.serializeTree(c)),
    };
  }

  private serializeSymbolTable(scope: ScopeNode): any[] {
    const result: any[] = [];
    const collect = (node: ScopeNode) => {
      for (const key in node.members) {
        const sym = node.members[key];
        result.push({
          type: sym.type,
          name: sym.name,
          scope: sym.scopeNumber,
          line: sym.lineNumber,
        });
      }
      for (const child of node.children) {
        collect(child);
      }
    };
    collect(scope);
    return result;
  }
}
