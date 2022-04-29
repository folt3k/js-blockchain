import sha256 from 'crypto-js/sha256';
import Transaction from './transaction';

class Block {
  timestamp: number;
  hash = '';
  nonce = 0;

  constructor(
    public index: number,
    public transactions: Transaction[] = [],
    public previousHash?: string
  ) {
    this.timestamp = new Date().getTime();
  }

  getHash(): string {
    return this.hash;
  }

  calculateHash(): string {
    return sha256(
      this.index +
        (this.previousHash || '') +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mine(difficulty: number = 0): void {
    const startTime = new Date().getTime();

    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Minning takes ${(new Date().getTime() - startTime) / 1000} seconds :)`);
  }
}

export default Block;
