'use strict';

const mongoose = require('mongoose');
const Models = require('./models')(mongoose);
const co = require('./util/co');
const batch = require('./util/batch');

const Block = Models.Block;
const Meta = Models.Meta;
const Entry = Models.Entry;
const StateCache = Models.StateCache;
const Tip = Models.Tip;
const Tx = Models.Transaction;
const Coin = Models.Coin;
const Address = Models.Address;
const Undo = Models.Undo;

const LOW = Buffer.from([0x00]);
const HIGH = Buffer.from([0xff]);

function mongoDB(options) {
  if (!(this instanceof mongoDB))
    return new mongoDB(options);

  this.binding = batch();
  this.dbhost = options.dbhost;
  this.dbname = options.dbname;
  this.connectionString = `mongodb://${this.dbhost}/${this.dbname}`;
  mongoose.Promise = global.Promise;
}

mongoDB.prototype.open = async function () {
  console.log('Opening MongoDB Connection');

  await mongoose.connect(this.connectionString, {
    minPoolSize: 1,
    maxPoolSize: 100,
  });
  console.log(`MongoDB Connected @ ${this.connectionString}`);
  this.loaded = true;
};

mongoDB.prototype.close = function () {
  mongoose.disconnect().then(() => {
    console.log('Mongoose connection with DB disconnected through app termination');
  });
};

// Temp function. Ensure integrity of mongo at startup.
mongoDB.prototype.preflight = async function (state) {
  const tipHash = state.tip.toString('hex');
  const tipBlock = await this.getBlockHeightByHash(tipHash);
  await Block.remove({ height: { $gt: tipBlock.height } });
  await Entry.remove({ height: { $gt: tipBlock.height } });
};

mongoDB.prototype.getTipHash = async function () {
  return await Meta.getTipHash();
};

mongoDB.prototype.setTipHash = async function (hash, cb) {
  return await Meta.setTipHash(hash, (err) => {
    if (err) {
      return cb(err);
    }
  });
};

mongoDB.prototype.setChainOptions = async function setChainOptions(options) {
  return await Meta.setChainOptions(options);
};

mongoDB.prototype.getChainOptions = async function getChainOptions() {
  return await Meta.getChainOptions();
};

mongoDB.prototype.saveEntry = async function saveEntry(hash, height, entry) {
  return await Entry.saveEntry(hash, height, entry);
};

mongoDB.prototype.deleteEntry = async function deleteEntry(hash) {
  return await Entry.deleteEntry(hash);
};

mongoDB.prototype.getEntries = async function getEntries() {
  return await Entry.getEntries();
};

mongoDB.prototype.getEntryByHash = async function getEntryByHash(hash) {
  return await Entry.getEntryByHash(hash);
};

mongoDB.prototype.getEntryByHeight = async function getEntryByHeight(height) {
  return await Entry.getEntryByHeight(height);
};

mongoDB.prototype.getEntryHashByHeight = async function getEntryHashByHeight(height) {
  return await Entry.getEntryHashByHeight(height);
};

mongoDB.prototype.getBlockHeightByHash = async function getBlockHeightByHash(hash) {
  return await Block.getBlockHeightByHash(hash);
};

mongoDB.prototype.getBlockHashByHeight = async function getBlockHashByHeight(height) {
  return await Block.getBlockHashByHeight(height);
};

mongoDB.prototype.updateNextBlock = async function updateNextBlock(hash, nextHash) {
  return await Block.updateNextBlock(hash, nextHash);
};

mongoDB.prototype.getNextHash = async function getNextHash(hash) {
  return await Block.getNextHash(hash);
};

mongoDB.prototype.saveTip = async function saveTip(hash, height) {
  return await Tip.saveTip(hash, height);
};

mongoDB.prototype.removeTip = async function removeTip(hash) {
  return await Tip.removeTip(hash);
};

mongoDB.prototype.getTips = async function getTips() {
  return await Tip.getTips();
};

mongoDB.prototype.saveBcoinBlock = async function saveBcoinBlock(entry, block) {
  return await Block.saveBcoinBlock(entry, block);
};

mongoDB.prototype.deleteBcoinBlock = async function deleteBcoinBlock(entry, block) {
  return await Block.deleteBcoinBlock(entry, block);
};

mongoDB.prototype.hasTx = async function hasTx(hash) {
  return await Tx.has(hash);
};

mongoDB.prototype.getTxMeta = async function getTxMeta(hash) {
  return await Tx.getTxMeta(hash);
};

mongoDB.prototype.getHashesByAddress = async function getHashesByAddress(addr) {
  return await Tx.getHashesByAddress(addr);
};

mongoDB.prototype.getNextHash = async function getNextHash(hash) {
  return await Block.getNextHash(hash);
};

mongoDB.prototype.getBlockByHeight = async function getBlockByHeight(height) {
  return await Block.byHeight(height);
};

mongoDB.prototype.setDeploymentBits = async function setDeploymentBits(bits) {
  return await Meta.setDeploymentBits(bits);
};

mongoDB.prototype.getDeploymentBits = async function getDeploymentBits() {
  return await Meta.getDeploymentBits();
};

mongoDB.prototype.getRawBlock = async function getRawBlock(hash) {
  return await Block.getRawBlock(hash);
};

mongoDB.prototype.saveBcoinTx = async function saveBcoinTx(entry, tx, meta) {
  return await Tx.saveBcoinTx(entry, tx, meta);
};

mongoDB.prototype.deleteBcoinTx = async function deleteBcoinTx(hash) {
  return await Tx.deleteBcoinTx(hash);
};

mongoDB.prototype.saveStateCache = async function saveStateCache(key, value) {
  return await StateCache.saveStateCache(key, value);
};

mongoDB.prototype.getStateCaches = async function getStateCaches() {
  return await StateCache.getStateCaches();
};

mongoDB.prototype.invalidateStateCache = async function invalidateStateCache() {
  return await StateCache.invalidate();
};

mongoDB.prototype.saveCoins = async function saveCoins(key, data, coin, hash, index) {
  return await Coin.saveCoins(key, data, coin, hash, index);
};

mongoDB.prototype.removeCoins = async function removeCoins(key) {
  return await Coin.removeCoins(key);
};

mongoDB.prototype.getCoins = async function getCoins(key) {
  return await Coin.getCoins(key);
};

mongoDB.prototype.hasCoins = async function hasCoins(key) {
  return await Coin.hasCoins(key);
};

mongoDB.prototype.hasDupeCoins = async function hasDupeCoins(key, height) {
  return await Coin.hasDupeCoins(key, height);
};

mongoDB.prototype.saveAddress = async function saveAddress(key, addr, hash, idx) {
  return await Address.saveAddress(key, addr, hash, idx);
};

mongoDB.prototype.getAddress = async function getAddress(key) {
  return await Address.getAddress(key);
};

mongoDB.prototype.getAddressesByHash160 = async function getAddressesByHash160(hash) {
  return await Address.getAddressesByHash160(hash);
};

mongoDB.prototype.removeAddress = async function removeAddress(key) {
  return await Address.removeAddress(key);
};

mongoDB.prototype.saveUndoCoins = async function saveUndoCoins(key, data) {
  return await Undo.saveUndoCoins(key, data);
};

mongoDB.prototype.getUndoCoins = async function getUndoCoins(key) {
  return await Undo.getUndoCoins(key);
};

mongoDB.prototype.removeUndoCoins = async function removeUndoCoins(key) {
  return await Undo.removeUndoCoins(key);
};

mongoDB.prototype.reset = async function reset(height = 0) {
  await Block.remove({ 'height': { $gte: height } });
  await Tx.remove({ 'height': { $gte: height } });
  await Entry.remove({ 'height': { $gte: height } });
  await Tip.remove({});
  await Meta.remove({});
  await Coin.remove({});
  await Address.remove({});
  await StateCache.remove({});
  await Undo.remove({});
};

mongoDB.prototype.batch = function (ops) {
  if (!ops) {
    if (!this.loaded)
      throw new Error('Database is closed.');
    return new Batch(this);
  }

  return new Promise((resolve, reject) => {
    if (!this.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    this.binding.batch(ops, co.wrap(resolve, reject));
  });
};

function Batch(db) {
  this.batch = db.binding.batch();
}

/**
 * Write a value to the batch.
 * @param {String|Buffer} key
 * @param {Buffer} value
 */

Batch.prototype.put = function put(key, value) {
  if (!value)
    value = LOW;

  this.batch.put(key, value);

  return this;
};

/**
 * Delete a value from the batch.
 * @param {String|Buffer} key
 */

Batch.prototype.del = function del(key) {
  this.batch.del(key);
  return this;
};

/**
 * Write batch to database.
 * @returns {Promise}
 */

Batch.prototype.write = function write() {
  return new Promise((resolve, reject) => {
    this.batch.write(co.wrap(resolve, reject));
  });
};

/**
 * Clear the batch.
 */

Batch.prototype.clear = function clear() {
  this.batch.clear();
  return this;
};

module.exports = mongoDB;
