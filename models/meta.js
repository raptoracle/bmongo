const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MetaSchema = new Schema({
  idx:          Number,
  tipHash:      Buffer,
  chainOptions: Buffer,
  deploymentBits: Buffer
});

MetaSchema.index({ idx: 1 });

MetaSchema.statics.setTipHash = function setTipHash(hash, cb) {
  this.model('Meta').updateOne(
    { 'idx': 0},
    { '$set': {
      'tipHash': Buffer.from(hash, 'hex')
      }
    },
    { upsert: true },
    cb
  );
};

MetaSchema.statics.getTipHash = async function getTipHash() {
  // Needs a preflight - if no document exists create a blank one
  const meta = this.model('Meta').findOne(
    { 'idx': 0}
  );

  if(meta != null)
    return meta.tipHash;

  return null;
};

MetaSchema.statics.setChainOptions = function setChainOptions(options) {
  return this.model('Meta').updateOne(
    { 'idx': 0 },
    { '$set': {
      'chainOptions': Buffer.from(options, 'hex')
    }},
    { upsert: true },
  );
};

// Wrapped in Promise to change results before returning to async/await
MetaSchema.statics.getChainOptions = async function getChainOptions() {
  const meta = this.model('Meta').findOne(
    { 'idx': 0}
  );

  if(chainOptions != null)
    return meta.chainOptions;
};

MetaSchema.statics.setDeploymentBits = function setDeploymentBits(bits) {
  return this.model('Meta').updateOne(
    { 'idx': 0 },
    { '$set': {
      deploymentBits: bits
    }},
    { upsert: true }
  );
};

MetaSchema.statics.getDeploymentBits = function getDeploymentBits() {
  const meta = this.model('Meta').findOne(
    { 'idx': 0}
  );

  if(meta != null)
    return meta.deploymentBits;
};

module.exports = MetaSchema;
