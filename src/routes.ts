import { Router } from 'express';
import axios from 'axios';

import blockchain from '../app';
import Transaction from './models/transaction';
import PeerNode from './models/node';
import Block from './models/block';

const router = Router();

router.post('/connect', async (req, res) => {
  const { nodes, host } = req.body;

  blockchain.host = new PeerNode(host);

  if (!nodes?.length) {
    return res.status(204).json({});
  }

  await Promise.all(
    nodes.map(async (node: string) => {
      try {
        const { data } = await axios.post<{
          nodes: PeerNode[];
          pendingTransactions: Transaction[];
          chain: Block[];
        }>(`${node}/listener/on-node-connection-request`, { host });

        if (data.nodes) {
          blockchain.updateNodes(data.nodes);
        }

        if (data.chain) {
          blockchain.updateChain(data.chain);
        }

        if (data.pendingTransactions) {
          blockchain.updatePendingTransactions(data.pendingTransactions);
        }

        return await Promise.resolve();
      } catch (e: any) {
        console.log(e);
        return await Promise.resolve();
      }
    }),
  );

  res.status(200).json({});
});

router.post('/listener/on-node-connection-request', (req, res) => {
  const { host } = req.body;

  blockchain.nodes.push(new PeerNode(host));

  res.status(200).json({
    nodes: [...blockchain.nodes, blockchain.host],
    chain: blockchain.chain,
    pendingTransactions: blockchain.pendingTransactions,
  });
});

router.get('/chain', (req, res) => {
  res.json({ data: { chain: blockchain.chain, length: blockchain.chain.length } });
});

router.post('/transactions', (req, res) => {
  const { fromAddress, toAddress, amount, privateKey } = req.body;
  const tx1 = new Transaction(fromAddress, toAddress, amount);

  try {
    tx1.sign(privateKey);
    blockchain.addTransaction(tx1);

    res.json(tx1);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/mine-block', async (req, res) => {
  const { minerAddress } = req.body;

  try {
    const block = await blockchain.mineBlock(minerAddress);

    console.log(blockchain.nodes);
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
          (t) => new Transaction(t.fromAddress, t.toAddress, t.amount, t.hash, t.signature),
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

export default router;
