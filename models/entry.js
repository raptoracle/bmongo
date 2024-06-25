const mongoose = require('mongoose');
// const util = require('./util');

const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  hash:   String,
  height: Number,
  data:   Buffer
});

EntrySchema.index({ hash: 1 });
EntrySchema.index({ height: 1 });

EntrySchema.statics.saveEntry = async function saveEntry(hash, height, entry) {
  const Entry = this.model('Entry');

  return await new Entry({
    'hash': hash.toString('hex'),
    'height': height,
    'data': Buffer.from(entry, 'hex')
  }).save();
};

EntrySchema.statics.deleteEntry = async function deleteEntry(hash) {
  return await this.model('Entry').find({ hash }).remove();
};

EntrySchema.statics.getEntries = async function getEntries() {
  return await this.model('Entry').find({});
};

EntrySchema.statics.getEntryByHash = async function getEntryByHash(hash) {
    const entry = await this.model('Entry').findOne(
      { hash: hash }
    );

    if(entry != null)
      return entry.data;
};

EntrySchema.statics.getEntryByHeight = async function getEntryByHeight(height) {
  const entry = await this.model('Entry').findOne(
    { height: height }
  );

  if(entry != null)
    return entry.data;
};

EntrySchema.statics.getEntryHashByHeight = async function getEntryHashByHeight(height) {
  const entry = await this.model('Entry').findOne(
    { height: height }
  );
  if(entry != null)
    return entry.hash;
};

module.exports = EntrySchema;
