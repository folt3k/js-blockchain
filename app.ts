import Blockchain from './src/models/blockchain';

// eslint-disable-next-line import/no-mutable-exports
let blockchain: Blockchain;

// @ts-ignore
if (!blockchain) {
  blockchain = new Blockchain();
}

export default blockchain;
