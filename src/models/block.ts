import sha256 from 'crypto-js/sha256';

import Transaction from './transaction';

class Block {
  constructor(
    public index: number,
    public transactions: Transaction[] = [],
    public previousHash: string | null = null,
    public timestamp = new Date().getTime(),
    public hash = '',
    public nonce = 0,
  ) {}

  calculateHash(options: { timestamp?: number; nonce?: number } = {}): string {
    return sha256(
      this.index +
        (this.previousHash || '') +
        (options.timestamp || this.timestamp) +
        JSON.stringify(this.transactions) +
        (options.nonce || this.nonce),
    ).toString();
  }

  mine(difficulty: number = 0): Promise<Block> {
    const mine = (
      cb: ({ hash, nonce, timestamp }: { hash: string; nonce: number; timestamp: number }) => void,
    ) => {
      const leadingZeros = Array(difficulty + 1).join('0');
      const timestamp = new Date().getTime();
      let nonce = 0;
      let hash = this.calculateHash({ timestamp, nonce });

      while (
        hash.substring(0, difficulty) !== leadingZeros &&
        new Date().getTime() <= timestamp + 1000
      ) {
        nonce++;
        hash = this.calculateHash({ timestamp, nonce });
      }

      if (hash.substring(0, difficulty) === leadingZeros) {
        cb({ hash, nonce, timestamp });
      }
    };

    return new Promise<Block>((resolve) => {
      const startTime = new Date().getTime();
      const interval = setInterval(() => {
        mine(({ hash, nonce, timestamp }: { hash: string; nonce: number; timestamp: number }) => {
          clearInterval(interval);

          this.hash = hash;
          this.nonce = nonce;
          this.timestamp = timestamp;

          console.log(`Minning takes ${(new Date().getTime() - startTime) / 1000} seconds :)`);
          resolve(this);
        });
      }, 1000);
    });
  }

  hasValidTransactions(): boolean {
    return this.transactions.every((tx) => tx.isValid());
  }
}

export default Block;
