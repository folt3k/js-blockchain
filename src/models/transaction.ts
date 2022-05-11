import { ec as EC } from 'elliptic';
import sha256 from 'crypto-js/sha256';

const ec = new EC('secp256k1');

class Transaction {
  constructor(
    public fromAddress: string | null,
    public toAddress: string,
    public amount: number,
    public hash?: string,
    public signature?: string,
    public timestamp?: number,
  ) {
    this.timestamp = timestamp || new Date().getTime();
    this.hash = hash || this.calculateHash;
  }

  get calculateHash(): string {
    return sha256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
  }

  sign(privateKey: string): void {
    try {
      const key = ec.keyFromPrivate(privateKey);
      const signature = key.sign(this.calculateHash, 'base64');
      this.signature = signature.toDER('hex');
    } catch (e) {
      throw new Error('Failed to create transaction signature!');
    }
  }

  isValid(): boolean {
    if (!this.fromAddress) {
      return true;
    }

    try {
      const key = ec.keyFromPublic(this.fromAddress as string, 'hex');
      return this.hash === this.calculateHash && key.verify(this.calculateHash, this.signature!);
    } catch (err) {
      return false;
    }
  }
}

export default Transaction;
