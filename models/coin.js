const mongoose = require('mongoose');
// const util = require('./util');

const Schema = mongoose.Schema;

const CoinSchema = new Schema({
  key:       Buffer,
  data:      Buffer,
  version:   Number,
  height:    Number,
  mintTxid:  String,
  mintIndex: Number,
  script:    String,
  coinbase:  Boolean,
  value:     Number,
  address:   String,
  wallets:   [String],
  spentTxId: String
});

CoinSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

CoinSchema.index({ key: 1 });
CoinSchema.index({ height: 1 });
CoinSchema.index({ mintTxid: 1, mintIndex: 1 });
CoinSchema.index({ address: 1 });
CoinSchema.index({ wallets: 1 }, { sparse: true });
CoinSchema.index({ spentTxid: 1 }, { sparse: true });

CoinSchema.statics.saveCoins = async function saveCoins(key, data, coin, hash, index) {
  const Coin = this.model('Coin');
  const output = coin.output.toJSON();

  return await new Coin({
    key,
    data,
    version:   coin.version,
    height:    coin.height,
    mintTxid:  hash,
    mintIndex: index,
    script:    output.script,
    coinbase:  coin.coinbase,
    value:     output.value,
    address:   output.address
  }).save();
};

CoinSchema.statics.getCoins = async function getCoins(key) {
  const coins = await this.model('Coin').findOne({ key });

  if (coins != null)
    return coins.data;

  return coins;
};

CoinSchema.statics.hasCoins = async function hasCoins(key) {
  const count = await this.model('Coin').count({ key });
  return count >= 1;
};

CoinSchema.statics.hasDupeCoins = async function hasDupeCoins(key, height) {
  const count = await this.model('Coin').count({
    key: key,
    height: { $lte: height }
  });

  return count >= 1;
};

CoinSchema.statics.removeCoins = async function removeCoins(key) {
  return await this.model('Coin').findOneAndDelete({ key });
};

module.exports = CoinSchema;
