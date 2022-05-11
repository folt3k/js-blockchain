import express, { Express } from 'express';
import bodyParser from 'body-parser';

import router from './src/routes';
import blockchain from './app';

const myPublicKey =
  '048a88f4c8c9cde13a5525342bd2cac2c22741eb3defa2aa5e84906ed07f4e4ff3641c160733daa503486057a64f35e231996b12334386de29046995c9ef908bd5';
const myPrivateKey = '65bfae2341526a02dca19ee2546068fc14c9942b377c9b162564b390558b283e';

const port = process.env.PORT || 3000;
const app: Express = express();

app.use(bodyParser.json());
app.use('/', router);

app.listen(port, async () => {
  console.log(`⚡ Server is running at http://localhost:${port}`);

  await blockchain.createGenesisBlock();
});
