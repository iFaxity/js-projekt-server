const mongo = require('../db');

const COLLECTION_NAME = 'users';

module.exports = {
  async create(user) {
    if (typeof user != 'object') {
      throw new TypeError(`Parameter user, expected string got ${typeof user}`);
    }

    const db = await mongo.connect(COLLECTION_NAME);
    return db.insertOne({ ...user, balance: 0, depot: {} });
  },

  async read(email) {
    if (typeof email != 'string') {
      throw new TypeError(`Parameter email, expected string got ${typeof email}`);
    }

    const db = await mongo.connect(COLLECTION_NAME);
    return db.findOne({ email });
  },

  async update(email, user) {
    if (typeof email != 'string') {
      throw new TypeError(`Parameter email, expected string got ${typeof email}`);
    } else if (typeof user != 'object') {
      throw new TypeError(`Parameter user, expected object got ${typeof user}`);
    }

    const db = await mongo.connect(COLLECTION_NAME);
    return db.updateOne({ email }, { $set: user });
  },
};
