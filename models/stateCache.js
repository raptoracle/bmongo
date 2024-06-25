const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StateCacheSchema = new Schema({
  key:   Buffer,
  value: Buffer
});

StateCacheSchema.index({ key: 1 });

StateCacheSchema.statics.saveStateCache = async function saveStateCache(key, value) {
  const StateCache = this.model('StateCache');

  return await new StateCache({
    key,
    value
  }).save();
};

StateCacheSchema.statics.getStateCache = async function getStateCache(key) {
  return await this.model('StateCache').findOne({ key });
};

StateCacheSchema.statics.getStateCaches = async function getStateCaches() {
  return await this.model('StateCache').find({});
};

StateCacheSchema.statics.invalidate = async function invalidate() {
  return await this.model('StateCache').remove({});
};

module.exports = StateCacheSchema;
