import { HardDrive } from './HardDrive';

export class HardDriveManager {
  public TRACKS = 4;
  public SECTORS = 8;
  public BLOCKS = 8;
  public BLOCK_SIZE = 64;
  public HEADER_LENGTH = 4;
  public DATA_LENGTH = this.BLOCK_SIZE - this.HEADER_LENGTH;
  public FILENAME_TRACKS = 1;
  public filenameArray: string[] = [];
  public FREE = '0';
  public IN_USE = '1';
  public SWAP_FILE = '2';
  public DEFAULT_LINK = '000';
  public hardDrive = new HardDrive(this.TRACKS, this.SECTORS, this.BLOCKS, this.BLOCK_SIZE);

  initialize(): void {
    this.filenameArray = [];
    for (let track = 0; track < this.TRACKS; track++) {
      for (let sector = 0; sector < this.SECTORS; sector++) {
        for (let block = 0; block < this.BLOCKS; block++) {
          let data = '';
          for (let i = 0; i < this.BLOCK_SIZE * 2 - this.HEADER_LENGTH; i++) data += '0';
          this.write(track, sector, block, data);
        }
      }
    }
    this.setHeader(0, 0, 0, this.IN_USE + this.DEFAULT_LINK);
    this.setContent(0, 0, 0, 'Reserved', true);
  }

  createFile(filename: string): boolean {
    if (filename.length > this.DATA_LENGTH) return false;
    if (this.filenameArray.includes(filename)) return false;

    const tsbFileName = this.getNextAvailableFilenameLocation();
    const tsbFileLocation = this.getNextAvailableFileLocation();
    if (tsbFileName && tsbFileLocation) {
      const tsbFN = this.toTSBArray(tsbFileName);
      this.setHeader(tsbFN[0], tsbFN[1], tsbFN[2], this.IN_USE + tsbFileLocation);
      this.setContent(tsbFN[0], tsbFN[1], tsbFN[2], filename, true);
      const tsbFL = this.toTSBArray(tsbFileLocation);
      this.setHeader(tsbFL[0], tsbFL[1], tsbFL[2], this.IN_USE + this.DEFAULT_LINK);
      this.filenameArray.push(filename);
      return true;
    }
    return false;
  }

  readFile(filename: string, isSwapFile: boolean): string | null {
    const filenameTsbStr = this.findTsbWithFilename(filename);
    if (filenameTsbStr) {
      const filenameTsb = this.toTSBArray(filenameTsbStr);
      let output = '';
      let link = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
      while (link !== this.DEFAULT_LINK) {
        const fileTsb = this.toTSBArray(link);
        if (isSwapFile) {
          output += this.read(fileTsb[0], fileTsb[1], fileTsb[2]).slice(this.HEADER_LENGTH);
        } else {
          output += this.toAsciiString(fileTsb[0], fileTsb[1], fileTsb[2]);
        }
        link = this.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
      }
      return output;
    }
    return null;
  }

  writeFile(filename: string, data: string): boolean {
    const convertedData = this.toHexString(data);
    const requiredBlocks = Math.ceil(convertedData.length / this.DATA_LENGTH);
    const availableBlocks = this.getNumOfAvailableBlocks();

    if (requiredBlocks > availableBlocks || !this.findTsbWithFilename(filename)) return false;

    const startTsb = this.toTSBArray(this.findTsbWithFilename(filename)!);
    const startHeader = this.getHeader(startTsb[0], startTsb[1], startTsb[2]);
    let link = startHeader.slice(1);
    let nextLocation = this.toTSBArray(link);
    const partitionedData = data.match(new RegExp('.{1,' + this.DATA_LENGTH + '}', 'g')) || [];

    // Free existing blocks
    while (link !== this.DEFAULT_LINK) {
      const linkTsb = this.toTSBArray(link);
      link = this.getHeader(linkTsb[0], linkTsb[1], linkTsb[2]).slice(1);
      this.setHeader(linkTsb[0], linkTsb[1], linkTsb[2], this.FREE + this.DEFAULT_LINK);
    }

    for (let i = 0; i < partitionedData.length; i++) {
      const nextFileLocation = (i < partitionedData.length - 1) ? this.getNextAvailableFileLocation()! : this.DEFAULT_LINK;
      this.setHeader(nextLocation[0], nextLocation[1], nextLocation[2], this.IN_USE + nextFileLocation);
      this.setContent(nextLocation[0], nextLocation[1], nextLocation[2], partitionedData[i], true);
      nextLocation = this.toTSBArray(nextFileLocation);
      this.setHeader(nextLocation[0], nextLocation[1], nextLocation[2], this.IN_USE + this.DEFAULT_LINK);
    }
    return true;
  }

  deleteFile(filename: string): boolean {
    const filenameTsbStr = this.findTsbWithFilename(filename);
    if (!filenameTsbStr) return false;
    const filenameTsb = this.toTSBArray(filenameTsbStr);
    const usedBit = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(0, 1);
    if (usedBit === this.SWAP_FILE) return false;

    let header = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
    while (header !== this.DEFAULT_LINK) {
      const link = this.toTSBArray(header);
      header = this.getHeader(link[0], link[1], link[2]).slice(1);
      this.setHeader(link[0], link[1], link[2], this.FREE + this.DEFAULT_LINK);
    }
    this.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], this.FREE + this.DEFAULT_LINK);
    this.filenameArray = this.filenameArray.filter(f => f !== filename);
    return true;
  }

  writeSwapFile(program: string[], pid: number): boolean {
    let data = program.join('');
    const requiredBlocks = Math.ceil(this.os_blockSize / this.DATA_LENGTH);
    const filenameLink = this.getNextAvailableFilenameLocation();
    const fileLink = this.getNextAvailableFileLocation();

    if (requiredBlocks < this.getNumOfAvailableBlocks() && filenameLink && fileLink) {
      const filenameTsb = this.toTSBArray(filenameLink);
      this.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], this.SWAP_FILE + fileLink);
      this.setContent(filenameTsb[0], filenameTsb[1], filenameTsb[2], '.Process' + pid, true);

      const fileLinkTsb = this.toTSBArray(fileLink);
      this.setHeader(fileLinkTsb[0], fileLinkTsb[1], fileLinkTsb[2], this.SWAP_FILE + this.DEFAULT_LINK);

      const partitionedData = data.match(new RegExp('.{1,' + (this.DATA_LENGTH * 2) + '}', 'g')) || [];
      for (let j = partitionedData.length; j < requiredBlocks; j++) partitionedData.push('00');

      let nextLink = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
      let nextTSB = this.toTSBArray(nextLink);
      this.setHeader(nextTSB[0], nextTSB[1], nextTSB[2], this.SWAP_FILE + this.DEFAULT_LINK);

      for (let i = 0; i < partitionedData.length; i++) {
        nextLink = (i < partitionedData.length - 1) ? this.getNextAvailableFileLocation()! : this.DEFAULT_LINK;
        this.setHeader(nextTSB[0], nextTSB[1], nextTSB[2], this.SWAP_FILE + nextLink);
        this.setContent(nextTSB[0], nextTSB[1], nextTSB[2], partitionedData[i].toLowerCase(), false);
        nextTSB = this.toTSBArray(nextLink);
        if (nextLink !== this.DEFAULT_LINK) {
          this.setHeader(nextTSB[0], nextTSB[1], nextTSB[2], this.SWAP_FILE + this.DEFAULT_LINK);
        }
      }
      return true;
    }
    return false;
  }

  deleteSwapFile(filename: string): boolean {
    const filenameTsbStr = this.findTsbWithFilename(filename);
    if (!filenameTsbStr) return false;
    const filenameTsb = this.toTSBArray(filenameTsbStr);
    let header = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
    while (header !== this.DEFAULT_LINK) {
      const link = this.toTSBArray(header);
      header = this.getHeader(link[0], link[1], link[2]).slice(1);
      this.setHeader(link[0], link[1], link[2], this.FREE + this.DEFAULT_LINK);
    }
    this.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], this.FREE + this.DEFAULT_LINK);
    return true;
  }

  // Memory block size reference (set by OsEngine)
  public os_blockSize = 256;

  getNextAvailableFilenameLocation(): string | null {
    for (let x = 0; x < this.FILENAME_TRACKS; x++)
      for (let y = 0; y < this.SECTORS; y++)
        for (let z = 0; z < this.BLOCKS; z++)
          if (this.getHeader(x, y, z).slice(0, 1) === this.FREE) return `${x}${y}${z}`;
    return null;
  }

  getNextAvailableFileLocation(): string | null {
    for (let x = this.FILENAME_TRACKS; x < this.TRACKS; x++)
      for (let y = 0; y < this.SECTORS; y++)
        for (let z = 0; z < this.BLOCKS; z++)
          if (this.getHeader(x, y, z).slice(0, 1) === this.FREE) return `${x}${y}${z}`;
    return null;
  }

  getNumOfAvailableBlocks(): number {
    let count = 0;
    for (let x = this.FILENAME_TRACKS; x < this.TRACKS; x++)
      for (let y = 0; y < this.SECTORS; y++)
        for (let z = 0; z < this.BLOCKS; z++)
          if (this.getHeader(x, y, z).slice(0, 1) === this.FREE) count++;
    return count;
  }

  getFileLs(): string[] {
    const ls: string[] = [];
    for (let x = 0; x < this.FILENAME_TRACKS; x++)
      for (let y = 0; y < this.SECTORS; y++)
        for (let z = 1; z < this.BLOCKS; z++)
          if (this.getHeader(x, y, z).slice(0, 1) === this.IN_USE) ls.push(this.toAsciiString(x, y, z));
    return ls;
  }

  findTsbWithFilename(filename: string): string | null {
    for (let x = 0; x < this.TRACKS; x++)
      for (let y = 0; y < this.SECTORS; y++)
        for (let z = 0; z < this.BLOCKS; z++) {
          const h = this.getHeader(x, y, z).slice(0, 1);
          if (h === this.IN_USE || h === this.SWAP_FILE)
            if (filename === this.toAsciiString(x, y, z)) return `${x}${y}${z}`;
        }
    return null;
  }

  setHeader(track: number, sector: number, block: number, newHeader: string): void {
    const data = this.read(track, sector, block);
    this.hardDrive.write(track, sector, block, newHeader + data.slice(this.HEADER_LENGTH));
  }

  getHeader(track: number, sector: number, block: number): string {
    return this.read(track, sector, block).slice(0, this.HEADER_LENGTH);
  }

  setContent(track: number, sector: number, block: number, newContent: string, toHex: boolean): void {
    const oldData = this.read(track, sector, block);
    const header = oldData.slice(0, this.HEADER_LENGTH);
    let newData = toHex ? this.toHexString(newContent) : newContent;
    const base = toHex ? newContent.length : newContent.length / 2;
    for (let i = base; i < this.DATA_LENGTH; i++) newData += '00';
    this.write(track, sector, block, header + newData);
  }

  getContent(track: number, sector: number, block: number): string {
    return this.read(track, sector, block).slice(this.HEADER_LENGTH);
  }

  write(track: number, sector: number, block: number, data: string): void {
    this.hardDrive.write(track, sector, block, data);
  }

  read(track: number, sector: number, block: number): string {
    return this.hardDrive.read(track, sector, block);
  }

  toHexString(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      let hex = data.charCodeAt(i).toString(16);
      if (hex.length < 2) hex = '0' + hex;
      result += hex;
    }
    return result;
  }

  toAsciiString(track: number, sector: number, block: number): string {
    let result = '';
    const content = this.getContent(track, sector, block);
    for (let i = 0; i < content.length; i += 2) {
      const curByte = content.charAt(i) + content.charAt(i + 1);
      if (curByte !== '00') result += String.fromCharCode(parseInt(curByte, 16));
    }
    return result;
  }

  toTSBArray(tsb: string): number[] {
    return [parseInt(tsb.charAt(0), 10), parseInt(tsb.charAt(1), 10), parseInt(tsb.charAt(2), 10)];
  }
}
