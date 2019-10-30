const { promisify } = require('util');
const randomBytes = promisify(require('crypto').randomBytes);
const mongo = require('../db');

const COLLECTION_NAME = 'depot';
const BASE64_REPLACERS = {
  '=': '',
  '+': '-',
  '/': '_',
};

function generateId() {
  return randomBytes(9).then(buf => {
    return buf.toString('base64').replace(/[=+/]/g, match => BASE64_REPLACERS[match]);
  });
}

module.exports = {
  async list() {
    const db = await mongo.connect(COLLECTION_NAME);
    const items = await db.find().toArray();

    // Map _id to id
    return items.map(({ _id, ...item }) => {
      return { id: _id, ...item };
    });
  },

  async read(id) {
    if (typeof id != 'string') {
      throw new TypeError(`Parameter id, expected string got ${typeof id}`);
    }

    const db = await mongo.connect(COLLECTION_NAME);
    const res = await db.findOne({ _id: id });

    if (!res) return null;

    // Map _id to id
    const { _id, ...item } = res;

    return { id, ...item };
  },

  async create(item) {
    if (typeof item != 'object') {
      throw new TypeError(`Parameter item, expected object got ${typeof item}`);
    }

    const db = await mongo.connect(COLLECTION_NAME);

    while (true) {
      try {
        item._id = await generateId();
        await db.insertOne(item);

        return item;
      } catch (ex) {
        if (ex.code != 11000) throw ex;
      }
    }
  },

  async update(item) {
    if (typeof item != 'object') {
      throw new TypeError(`Parameter item, expected object got ${typeof item}`);
    }

    const { id, ...data } = item;

    const db = await mongo.connect(COLLECTION_NAME);
    await db.updateOne({ _id: id }, { $set: data });
  }
};
