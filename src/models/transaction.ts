class Transaction {
  constructor(public fromAddress: string | null, public toAddress: string, public amount: number) {}
}

export default Transaction;
