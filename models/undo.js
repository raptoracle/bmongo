const mongoose = require('mongoose');
// const util = require('./util');

const Schema = mongoose.Schema;

const UndoSchema = new Schema({
  key:  Buffer,
  data: Buffer
});

UndoSchema.index({ key: 1 });

UndoSchema.statics.saveUndoCoins = async function saveUndoCoins(key, data) {
  const Undo = this.model('Undo');
  return await new Undo({
    key,
    data
  }).save();
};

UndoSchema.statics.getUndoCoins = async function getUndoCoins(key) {
  const coins = await this.model('Undo').findOne({ key });

  if(coins != null)
    return coins.data;

  return coins;
};

UndoSchema.statics.removeUndoCoins = async function removeUndoCoins(key) {
  return await this.model('Undo').findOneAndDelete({ key });
};

module.exports = UndoSchema;
