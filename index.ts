import express, { Express } from 'express';
import bodyParser from 'body-parser';

import router from './src/routes';
import blockchain from './app';

const port = process.env.PORT || 3000;
const app: Express = express();

app.use(bodyParser.json());
app.use('/', router);

app.listen(port, async () => {
  console.log(`⚡ Server is running at http://localhost:${port}`);

  await blockchain.createGenesisBlock();
});
