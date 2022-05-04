import { ec as EC } from 'elliptic';
import sha256 from 'crypto-js/sha256';

const ec = new EC('secp256k1');

class Transaction {
  private signature!: string;

  constructor(public fromAddress: string | null, public toAddress: string, public amount: number) {}

  get calculateHash(): string {
    return sha256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  sign(privateKey: string): void {
    const key = ec.keyFromPrivate(privateKey);
    const signature = key.sign(this.calculateHash, 'base64');
    this.signature = signature.toDER('hex');
  }

  isValid(): boolean {
    if (!this.fromAddress) {
      return true;
    }

    try {
      const key = ec.keyFromPublic(this.fromAddress as string, 'hex');
      return key.verify(this.calculateHash, this.signature);
    } catch (err) {
      return false;
    }
  }
}

export default Transaction;
