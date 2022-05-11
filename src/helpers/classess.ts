import Block from '../models/block';
import Transaction from '../models/transaction';

export const plainBlockToClass = (block: Block): Block =>
  new Block(
    block.index,
    block.transactions.map(
      (t) =>
        new Transaction(t.fromAddress, t.toAddress, t.amount, t.hash, t.signature, t.timestamp),
    ),
    block.previousHash,
    block.timestamp,
    block.hash,
    block.nonce,
  );

export const plainTransactionToClass = (tx: Transaction): Transaction =>
  new Transaction(tx.fromAddress, tx.toAddress, tx.amount, tx.hash, tx.signature, tx.timestamp);
