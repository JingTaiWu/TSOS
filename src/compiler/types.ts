export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface CompilerLogEntry {
  level: LogLevel;
  source: string;
  message: string;
}

export interface CompilationResult {
  success: boolean;
  hexOutput: string;
  tokens: { index: number; kind: string; value: string }[];
  cstRoot: any | null;
  astRoot: any | null;
  symbolTable: any | null;
  logs: CompilerLogEntry[];
}
