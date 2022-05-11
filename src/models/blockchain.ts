import { uniqBy } from 'lodash';

import Block from './block';
import Transaction from './transaction';
import PeerNode from './node';
import { plainBlockToClass, plainTransactionToClass } from '../helpers/classess';

class Blockchain {
  chain: Block[] = [];
  nodes: PeerNode[] = [];
  host!: PeerNode;
  pendingTransactions: Transaction[] = [];
  difficulty = 2;
  minningReward = 100;

  createGenesisBlock(): Promise<void> {
    const genesisBlock = new Block(0, []);
    return genesisBlock.mine(this.difficulty).then((block) => {
      this.chain[0] = block;
    });
  }

  updateChain(inputChain: Block[]): void {
    const chain = inputChain.map((block) => plainBlockToClass(block));
    const isChainValid = this.isChainValid(chain);

    if (isChainValid) {
      this.chain = chain;
    }
  }

  updateNodes(inputNodes: PeerNode[]): void {
    this.nodes = uniqBy([...inputNodes.map((n) => new PeerNode(n.host))], 'host');
  }

  updatePendingTransactions(inputPendingTransactions: Transaction[]): void {
    this.pendingTransactions = uniqBy(
      [
        ...this.pendingTransactions,
        ...inputPendingTransactions.map((t) => plainTransactionToClass(t)),
      ],
      'hash',
    ).filter((t) => t.isValid());
  }

  mineBlock(miningRewardAddress: string): Promise<Block> {
    const transactions = this.pendingTransactions
      .filter((t) => t.isValid())
      .filter((t) => !this.isTransactionExists(t));

    const block = new Block(this.chain.length, transactions, this.getLastBlock().hash);

    return block.mine(this.difficulty).then((minedBlock) => {
      if (this.isChainValid([...this.chain, minedBlock])) {
        this.chain.push(minedBlock);
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.minningReward)];
        // TODO ... send this transaction
        return minedBlock;
      }

      throw new Error('Blockchain invalid!');
    });
  }

  addTransaction(transaction: Transaction): void {
    if (!transaction.isValid()) {
      throw new Error('Invalid transaction');
    }

    if (this.isTransactionExists(transaction)) {
      throw new Error('Transaction exists!');
    }

    if (this.getBalance(transaction.fromAddress!) >= transaction.amount) {
      this.pendingTransactions.push(transaction);
    } else {
      throw new Error('No sufficient funnds!');
    }
  }

  private isTransactionExists(checkingTransaction: Transaction): boolean {
    let exists = false;

    for (let i = 0; i < this.chain.length; i++) {
      for (let t = 0; t < this.chain[i].transactions.length; t++) {
        const transaction = this.chain[i].transactions[t];

        if (checkingTransaction.hash === transaction.hash) {
          exists = true;
          break;
        }
      }
    }

    return exists;
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

  isChainValid(chain = this.chain): boolean | never {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const prevBlock = chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        throw new Error(`Hash of block #${currentBlock.index} is not correct`);
      }

      if (currentBlock.previousHash !== prevBlock.hash) {
        throw new Error(`Hash of block #${currentBlock.index} is not equal to its previous block`);
      }

      if (!currentBlock.hasValidTransactions()) {
        throw new Error(`Block ${currentBlock.index} has invalid transactions`);
      }
    }

    return true;
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}

export default Blockchain;
