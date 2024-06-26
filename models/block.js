const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;
// These limits can be overriden higher up the stack
const MAX_BLOCKS = 100;

const BlockSchema = new Schema({
  network:           { type:  String, default:  '' },
  mainChain:         { type:  Boolean, default: false },
  height:            { type:  Number, default:  0 },
  hash:              { type:  String, default:  '' },
  version:           { type:  Number, default:  0 },
  merkleRoot:        { type:  String, default:  '' },
  time:              { type:  Date, default:    0 },
  timeNormalized:    { type:  Date, default:    0 },
  nonce:             { type:  Number, default:  0 },
  previousBlockHash: { type:  String, default:  '' },
  nextBlockHash:     { type:  String, default:  '' },
  transactionCount:  { type:  Number, default:  1},
  size:              { type:  Number, default:  0 },
  bits:              { type:  Number, default:  0 },
  reward:            { type:  Number, default:  0 },
  chainwork:         { type:  Number, default:  0 },
  txs:               [{ type: String, default:  '' }],
  poolInfo:          { type:  Object, default:  {} },
  rawBlock:          { type:  Buffer, default:  '' }
}, {
  toJSON: {
    virtuals: true
  },
  id: false
});

BlockSchema.index({ hash: 1 }, { unique: true });
BlockSchema.index({ height: 1 });
BlockSchema.index({ time: 1 });
BlockSchema.index({ timeNormalized: 1 });
BlockSchema.index({ mainChain: 1 });
BlockSchema.index({ previousBlockHash: 1, mainChain: 1 });

BlockSchema.statics.byHeight = async function byHeight(height) {
  return await this.model('Block').findOne({ height });
};

BlockSchema.statics.byHash = async function byHash(hash) {
  return await this.model('Block').findOne({ hash });
};

BlockSchema.statics.getRawBlock = async function getRawBlock(hash) {
  const block = await this.model('Block').findOne(
    { hash },
    { rawBlock: 1 }
  );

  if(block != null)
    return Buffer.from(block.rawBlock, 'hex');
};

BlockSchema.statics.last = async function last(cb) {
  return await this.model('Block').find(
    {},
    cb)
    .limit(MAX_BLOCKS)
    .sort({ height: -1 });
};

BlockSchema.statics.getHeights = async function getHeights(cb) {
  return await this.model('Block').find(
    {},
    { height: 1 },
    cb)
    .sort({ height: 1 });
};

BlockSchema.statics.tipHash = async function tipHash(cb)  {
  return await this.last((err, block) => {
    if (err) {
      return cb(err);
    }
    return cb(null, block.hash);
  })
    .limit(1);
};

BlockSchema.statics.getBlockHeightByHash = async function getBlockHeightByHash(hash) {
  return await this.model('Block').findOne({ hash });
};

BlockSchema.statics.getBlockHashByHeight = async function getBlockHashByHeight(height) {
  const block = await this.model('Block').findOne(
    { height },
    { hash: 1 }
  );

  if(block != null)
    return Buffer.from(block.hash, 'hex');

  return block;
};

BlockSchema.statics.updateNextBlock = async function updateNextBlock(hash, nextHash) {
  const block = await this.model('Block').findOneAndUpdate(
    {hash: hash},
    {nextBlockHash: nextHash}
  );

  return block;
};

BlockSchema.statics.getNextHash = async function getNextHash(hash) {
  const block = await this.model('Block').findOne(
    {hash: hash}
  );

  if(block != null)
    return block.nextBlockHash;

  return block;
};

BlockSchema.statics.saveBcoinBlock = async function saveBcoinBlock(entry, block) {
  const Block     = this.model('Block');
  const rawBlock  = block.toRaw();
  const blockJSON = block.toJSON();
  const reward    = util.calcBlockReward(entry.height);

  return await new Block({
    mainChain:         true,
    hash:              block.hash().toString('hex'),
    height:            entry.height,
    size:              block.getSize(),
    version:           blockJSON.version,
    previousBlockHash: blockJSON.prevBlock,
    merkleRoot:        blockJSON.merkleRoot,
    time:              blockJSON.time * 1000,
    timeNormalized:    blockJSON.time * 1000,
    bits:              blockJSON.bits,
    nonce:             blockJSON.nonce,
    transactionCount:  block.txs.length,
    txs:               block.txs.map((tx) => {
      const txJSON = tx.toJSON();
      return txJSON.hash;
    }),
    chainwork:         entry.chainwork,
    reward,
    network:           'main',
    poolInfo:          {},
    rawBlock
  }).save();
};

BlockSchema.statics.deleteBcoinBlock = function deleteBcoinBlock(hash) {
  return this.model('Block').findOneAndDelete({ hash });
};

module.exports = BlockSchema;
