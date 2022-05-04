import Block from './block';
import Transaction from './transaction';

class Blockchain {
  chain: Block[] = [new Block(0, [])];
  difficulty = 1;
  pendingTransactions: Transaction[] = [];
  minningReward = 100;

  constructor() {
    this.chain[0].mine(this.difficulty);
  }

  mineBlock(miningRewardAddress: string): Block {
    const block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.getPreviousBlock().getHash(),
    );

    block.mine(this.difficulty);
    this.chain.push(block);

    this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.minningReward)];

    return block;
  }

  addTransaction(transaction: Transaction): void {
    if (this.getBalance(transaction.fromAddress!) >= transaction.amount) {
      if (transaction.isValid()) {
        this.pendingTransactions.push(transaction);
      } else {
        throw new Error('Invalid transaction');
      }
    } else {
      throw new Error('No sufficient funnds!');
    }
  }

  getBalance(address: string): number {
    let balance = 0;

    for (let i = 0; i < this.chain.length; i++) {
      for (let t = 0; t < this.chain[i].transactions.length; t++) {
        const transaction = this.chain[i].transactions[t];

        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid(): boolean | never {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.getHash() !== currentBlock.calculateHash()) {
        throw new Error(`Hash of block #${currentBlock.index} is not correct`);
      }

      if (currentBlock.previousHash !== prevBlock.getHash()) {
        throw new Error(`Hash of block #${currentBlock.index} is not equal to its previous block`);
      }

      if (!currentBlock.hasValidTransactions()) {
        throw new Error(`Block ${currentBlock.index} has invalid transactions`);
      }
    }

    return true;
  }

  private getPreviousBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}

export default Blockchain;
