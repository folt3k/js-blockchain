import express, { Express } from 'express';

const app: Express = express();

app.get('/', (req, res) => {
  res.send('Test');
});

app.listen(3000, () => {
  console.log(`⚡ Server is running at http://localhost:${3000}`);
});
