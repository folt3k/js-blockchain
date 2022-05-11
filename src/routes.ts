import { Router } from 'express';
import axios from 'axios';

import blockchain from '../app';
import Transaction from './models/transaction';
import PeerNode from './models/node';
import Block from './models/block';
import connectionController from './controllers/connection';

const router = Router();

router.post('/connect', connectionController.connect);
router.post('/listener/on-node-connection-request', connectionController.onNodeConnectionRequest);

router.get('/chain', (req, res) => {
  res.json({ data: { chain: blockchain.chain, length: blockchain.chain.length } });
});

router.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, privateKey } = req.body;
  const tx1 = new Transaction(fromAddress, toAddress, amount);

  try {
    tx1.sign(privateKey);
    blockchain.addTransaction(tx1);

    blockchain.nodes.forEach((node) => {
      axios.post(`${node.host}/listener/on-transaction-created`, { transaction: tx1 });
    });

    res.json(tx1);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/mine-block', async (req, res) => {
  const { minerAddress } = req.body;

  try {
    const block = await blockchain.mineBlock(minerAddress);

    blockchain.nodes.forEach((node) => {
      axios.post(`${node.host}/listener/on-block-mined`, { block });
    });

    res.status(200).json(block);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/listener/on-block-mined', (req, res) => {
  const block: Block = req.body.block;
  const lastBlock = blockchain.getLastBlock();

  if (lastBlock.hash === block.previousHash) {
    const chain = [
      ...blockchain.chain,
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
      ),
    ];

    if (blockchain.isChainValid(chain)) {
      blockchain.chain = chain;

      blockchain.nodes.forEach((node) => {
        axios.post(`${node.host}/listener/on-block-mined`, { block });
      });
    }
  }
});

router.post('/listener/on-transaction-created', (req, res) => {
  const { transaction } = req.body;

  try {
    blockchain.updatePendingTransactions([transaction]);

    res.json(transaction);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
