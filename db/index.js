const MongoClient = require('mongodb').MongoClient;
const { DB_NAME } = require('@ifaxity/env');

const MONGO_OPTS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client = null;

/**
 * Connects to a collection in the Mongo database
 * @param {string} collection - Collection name
 */
exports.connect = async function connect(collection) {
  if (client == null) {
    client = await MongoClient.connect('mongodb://localhost:27017', MONGO_OPTS).catch(ex => {
      console.error(ex);
      process.exit(1);
    });
  }

  const db = await client.db(DB_NAME);

  return collection ? db.collection(collection) : db;
};

/**
 * Closes the cached mongodb connection
 */
exports.close = async function close() {
  if (client != null) {
    await client.close();
    client = null;
  }
};

