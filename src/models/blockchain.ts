import { uniqBy } from 'lodash';

import Block from './block';
import Transaction from './transaction';
import PeerNode from './node';

class Blockchain {
  chain: Block[] = [];
  nodes: PeerNode[] = [];
  host!: PeerNode;
  pendingTransactions: Transaction[] = [];
  difficulty = 1;
  minningReward = 100;

  createGenesisBlock(): Promise<void> {
    // const genesisBlock = new Block(0, []);
    // return genesisBlock.mine(this.difficulty).then((block) => {
    //   this.chain[0] = block;
    //   console.log(this.chain[0])
    // });

    this.chain[0] = new Block(
      0,
      [],
      null,
      1652180677624,
      '0a7bc464e6b9ba766c12834bccc5bba2c798a0a99c1b26f06ee3be8560df46bb',
      14,
    );

    return Promise.resolve();
  }

  updateChain(inputChain: Block[]): void {
    const chain = inputChain.map(
      (block) =>
        new Block(
          block.index,
          block.transactions.map(
            (t) => new Transaction(t.fromAddress, t.toAddress, t.amount, t.hash, t.signature),
          ),
          block.previousHash,
          block.timestamp,
          block.hash,
          block.nonce,
        ),
    );

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
        ...inputPendingTransactions.map(
          (t) => new Transaction(t.fromAddress, t.toAddress, t.amount, t.hash),
        ),
      ],
      'hash',
    ).filter((t) => t.isValid());
  }

  mineBlock(miningRewardAddress: string): Promise<Block> {
    const block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.getLastBlock().getHash(),
    );

    return block.mine(this.difficulty).then((minedBlock) => {
      this.chain.push(minedBlock);
      this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.minningReward)];

      return minedBlock;
    });
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

        if (transaction.toAddress !== address) {
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

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}

export default Blockchain;
