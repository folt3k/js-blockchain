import { Router } from 'express';

import blockchain from '../app';
import Transaction from './models/transaction';

const router = Router();

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
    res.status(200).json(block);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
