import axios from 'axios';
import { Request, Response } from 'express';

import blockchain from '../../app';
import PeerNode from '../models/node';
import Transaction from '../models/transaction';
import Block from '../models/block';

const connectionController = {
  connect: async (req: Request, res: Response) => {
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

          if (data.chain && data.chain.length > blockchain.chain.length) {
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
  },
  onNodeConnectionRequest: (req: Request, res: Response) => {
    const { host } = req.body;

    blockchain.nodes.push(new PeerNode(host));

    res.status(200).json({
      nodes: [...blockchain.nodes, blockchain.host],
      chain: blockchain.chain,
      pendingTransactions: blockchain.pendingTransactions,
    });
  },
};

export default connectionController;
