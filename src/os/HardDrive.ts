export class HardDrive {
  private storage: Map<string, string> = new Map();

  constructor(
    private tracks: number,
    private sectors: number,
    private blocks: number,
    private blockSize: number
  ) {}

  write(track: number, sector: number, block: number, data: string): void {
    this.storage.set(this.getKey(track, sector, block), data);
  }

  read(track: number, sector: number, block: number): string {
    return this.storage.get(this.getKey(track, sector, block)) || '';
  }

  getKey(track: number, sector: number, block: number): string {
    return `${track}${sector}${block}`;
  }
}
