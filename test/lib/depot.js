const assert = require('assert').strict;
const Depot = require('../../lib/depot');
const mongo = require('../../db');

async function createItem(data) {
  const depot = await mongo.connect('depot');
  await depot.insertOne(data);
}

async function findItem(id) {
  const depot = await mongo.connect('depot');
  return depot.findOne({ _id: id });
}

describe('Depot object', () => {
  before(async () => {
    // Create users collection
    const db = await mongo.connect();
    await db.createCollection('depot');
  });

  afterEach(async () => {
    // Clear user collection after each test
    const depot = await mongo.connect('depot');
    await depot.deleteMany({});
  });

  after(async () => {
    // Ensure users are deleted after test is done
    const db = await mongo.connect();
    await db.dropCollection('depot');
    await mongo.close();
  });

  // Test cases
  describe('async list()', () => {
    it('with items', async () => {
      await createItem({ title: 'Hello world' });
      await createItem({ name: 'Test item' });
      const items = await Depot.list();

      assert.equal(items.length, 2);
      assert.equal(items[0].title, 'Hello world');
      assert.equal(items[1].name, 'Test item');
    });

    it('without items', async() => {
      const items = await Depot.list();

      assert.equal(items.length, 0);
    });
  });

  describe('async create()', () => {
    it('with argument', async () => {
      const { _id } = await Depot.create({ hello: 'World!' });
      const item = await findItem(_id);

      assert.equal(item._id, _id);
      assert.equal(item.hello, 'World!');
    });

    it('without argument', async () => {
      await assert.rejects(() => Depot.create());
    });
  });

  describe('async read()', () => {
    it('with argument', async () => {
      await createItem({ _id: 'test_item', title: 'Hello world' });

      const item = await Depot.read('test_item');
      assert.equal(item.id, 'test_item');
      assert.equal(item.title, 'Hello world');
    });

    it('with nonexistent item', async () => {
      const item = await Depot.read('not$a(Valid+Id');
      assert.equal(item, null);
    });

    it('without argument', async () => {
      await assert.rejects(() => Depot.read());
    });
  });

  describe('async update()', () => {
    it('with argument', async () => {
      await createItem({ _id: 'custom_id', foo: 'bar' });
      await Depot.update({ id: 'custom_id', foo: 'baz', ok: true });

      const item = await findItem('custom_id');
      assert.equal(item.foo, 'baz');
      assert.equal(item.ok, true);
    });

    it('without argument', async () => {
      await assert.rejects(() => Depot.update());
    });

    it('with nonexistent item', async () => {
      // Should not throw, but item should not exist
      await Depot.update({ id: 'this_should_not_exist', title: 'Some item' });

      const item = await findItem('this_should_not_exist');
      assert.equal(item, null);
    });
  });
});
