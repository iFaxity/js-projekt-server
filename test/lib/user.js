const assert = require('assert').strict;
const User = require('../../lib/user');
const mongo = require('../../db');

async function createUser(data) {
  const users = await mongo.connect('users');
  await users.insertOne(data);
}

async function findUser(email) {
  const users = await mongo.connect('users');
  return users.findOne({ email });
}

describe('User object', () => {
  before(async () => {
    // Create users collection
    const db = await mongo.connect();
    const users = await db.createCollection('users');

    await users.createIndex('email');
  });

  afterEach(async () => {
    // Clear user collection after each test
    const users = await mongo.connect('users');
    await users.deleteMany({});
  });

  after(async () => {
    // Ensure users are deleted after test is done
    const db = await mongo.connect();
    await db.dropCollection('users');
    await mongo.close();
  });

  // Test cases
  describe('async create()', () => {
    it('with argument', async () => {
      await User.create({
        email: 'test@foo.com',
        name: 'Test Tester',
        password: 'notverysafe',
      });

      const users = await mongo.connect('users');
      const user = await users.findOne({ email: 'test@foo.com' });

      assert.equal(user.email, 'test@foo.com');
      assert.equal(user.name, 'Test Tester');
      assert.equal(user.password, 'notverysafe');
      assert.equal(user.balance, 0);
      assert.ok(typeof user.depot == 'object');
      assert.equal(Object.keys(user.depot).length, 0);
    });

    it('without argument', async () => {
      await assert.rejects(() => User.create());
    });
  });

  describe('async read()', () => {
    it('with argument', async () => {
      await createUser({
        email: 'foo@example.com',
        name: 'Foo Tester',
        password: 'Password123',
      });

      const user = await User.read('foo@example.com');

      assert.equal(user.email, 'foo@example.com');
      assert.equal(user.name, 'Foo Tester');
      assert.equal(user.password, 'Password123');
    });

    it('with nonexistent user', async () => {
      const user = await User.read('notauser@example.com');
      assert.equal(user, null);
    });

    it('without argument', async () => {
      await assert.rejects(() => User.read());
    });
  });

  describe('async update()', () => {
    it('with argument', async () => {
      await createUser({
        email: 'bar@example.com',
        name: 'Bar Tester',
        password: 'Letmein456',
      });

      await User.update('bar@example.com', {
        email: 'user@example.com',
        name: 'Some User',
        password: 'NotSecure97',
      });

      const user = await findUser('user@example.com');
      assert.equal(user.email, 'user@example.com');
      assert.equal(user.name, 'Some User');
      assert.equal(user.password, 'NotSecure97');
    });

    it('without arguments', async () => {
      await assert.rejects(() => User.update());
    });

    it('without user argument', async () => {
      await assert.rejects(() => User.update('hello@world.com'));
    });
  });
});
