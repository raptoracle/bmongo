const mongoose = require('mongoose');
const Input = require('./input');
const Output = require('./output');
const util = require('./util');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  txid:                String,
  type:                Number,
  fee:                 Number,
  rate:                Number,
  ps:                  Number,
  blockHeight:         Number,
  blockHash:           String,
  blockTime:           Date,
  blockTimeNormalized: Date,
  index:               Number,
  version:             Number,
  flag:                Number,
  lockTime:            Number,
  inputs:              [Input.schema],
  outputs:             [Output.schema],
  size:                Number,
  network:             String,
  mainChain:           Boolean,
  mempool:             Boolean,
  rawTx:               Buffer,
  meta:                Buffer,
  raw:                 Buffer
});

TransactionSchema.index({ txid: 1 });
TransactionSchema.index({ blockHeight: 1 });
TransactionSchema.index({ blockHash: 1 });
TransactionSchema.index({ blockTime: 1 });
TransactionSchema.index({ blockTimeNormalized: 1 });
TransactionSchema.index({ 'inputs.address': 1 });
TransactionSchema.index({ 'outputs.address': 1 });
TransactionSchema.index({ mempool: 1 });
TransactionSchema.index({ type: 1});

TransactionSchema.statics.saveBcoinTx = async function saveBcoinTx(entry, tx, meta)  {
  const Transaction = this.model('Transaction');
  const txJSON = tx.toJSON();

  const t = new Transaction({
    txid:                txJSON.hash,
    type:                txJSON.type,
    fee:                 txJSON.fee,
    rate:                txJSON.rate,
    ps:                  txJSON.ps,
    blockHeight:         txJSON.height,
    blockHash:           meta.hash,
    blockTime:           meta.time * 1000,
    blockTimeNormalized: meta.time * 1000,
    index:               txJSON.index,
    version:             txJSON.version,
    flag:                txJSON.flag,
    inputs:              tx.inputs.map((input)   => {
      const inputJSON = input.toJSON();
      return {
        address: inputJSON.address
      };
    }),
    outputs:             tx.outputs.map((output) => {
      const outputJSON = output.toJSON();
      return {
        address: outputJSON.address
        };
    }),
    lockTime:            txJSON.locktime,
    network:             'main',
    mainChain:           true,
    mempool:             false,
    meta:                meta.toRaw(),
    raw:                 tx.toRaw()
  });

  await t.save().then((err) => {
    console.log(err);
  });
};

TransactionSchema.statics.deleteBcoinTx = async function deleteBcoinTx(txid) {
  return await this.model('Transaction').findAndDeleteOne({ txid });
};

TransactionSchema.statics.getHashesByAddress = async function getHashesByAddress(addr) {
  const transaction = await this.model('Transaction').find(
    {
      $or: [
        { 'inputs.address': addr },
        { 'outputs.address': addr }]
    },
    {
      txid: 1
    },
      (err, txs) => {
        err ? rej(err) : res(txs.map((tx) => {
          return util.revHex(tx.txid);
        }));
      }
  );

  return transaction;

};

TransactionSchema.statics.has = async function has(txid) {
  const count = await this.model('Transaction').count({ txid });
  return count >= 1;
};

TransactionSchema.statics.getTxMeta = async function getTxMeta(txid)  {

  const tx = this.model('Transaction').findOne(
    { txid: util.revHex(txid) },
    { meta: 1 }
  );

  if(tx != null && tx.meta != null)
    return res(Buffer.from(tx.meta, 'hex'));

  return null;
};

module.exports = TransactionSchema;
