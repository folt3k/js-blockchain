import express, { Express } from 'express';

import Blockchain from './src/models/blockchain';
import Transaction from './src/models/transaction';

const myPublicKey =
  '048a88f4c8c9cde13a5525342bd2cac2c22741eb3defa2aa5e84906ed07f4e4ff3641c160733daa503486057a64f35e231996b12334386de29046995c9ef908bd5';
const myPrivateKey = '65bfae2341526a02dca19ee2546068fc14c9942b377c9b162564b390558b283e';

const app: Express = express();

const blockchain = new Blockchain();

app.get('/', (req, res) => {
  res.send('Test');
});

app.listen(3000, () => {
  console.log(`⚡ Server is running at http://localhost:${3000}`);

  blockchain.mineBlock(myPublicKey);
  blockchain.mineBlock('tomek');
  const tx1 = new Transaction(
    '048a88f4c8c9cde13a5525342bd2cac2c22741eb3defa2aa5e84906ed07f4e4ff3641c160733daa503486057a64f35e231996b12334386de29046995c9ef908bd5',
    'tomek',
    100,
  );
  // tx1.sign(myPrivateKey);
  blockchain.addTransaction(tx1);
  blockchain.mineBlock('tomek');

  console.log(blockchain.chain);
  console.log(blockchain.getBalance('kamil'));
  console.log(blockchain.getBalance('tomek'));
  console.log(blockchain.isChainValid());
});
