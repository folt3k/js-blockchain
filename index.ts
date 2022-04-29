import express, { Express } from 'express';

import Blockchain from './src/models/blockchain';
import Transaction from './src/models/transaction';

const app: Express = express();

const blockchain = new Blockchain();

app.get('/', (req, res) => {
  res.send('Test');
});

app.listen(3000, () => {
  console.log(`⚡ Server is running at http://localhost:${3000}`);
  blockchain.mineBlock('kamil');
  blockchain.mineBlock('tomek');
  blockchain.addTransaction(new Transaction('kamil', 'tomek', 100));
  blockchain.mineBlock('tomek');

  console.log(blockchain.chain);
  console.log(blockchain.getBalance('kamil'));
  console.log(blockchain.getBalance('tomek'));

  console.log(blockchain.isChainValid());
});
