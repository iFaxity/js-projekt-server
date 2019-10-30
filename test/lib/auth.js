const assert = require('assert').strict;
const Auth = require('../../lib/auth');
const mongo = require('../../db');

// JWT token should have 3 parts (header.payload.signature)
function isJWT(token) {
  return typeof token == 'string' && token.split('.').length == 3;
}

describe('Auth object', () => {
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
  describe('async createToken()', () => {
    it('without payload', async () => {
      const token = await Auth.createToken({});

      assert.ok(isJWT(token));
    });

    it('with payload', async () => {
      const token = await Auth.createToken({
        email: 'some@email.com',
      });

      assert.ok(isJWT(token));
    });
  });

  describe('async createPassword()', () => {
    it('with password', async () => {
      const password = await Auth.createPassword('Hello123');

      assert.equal(typeof password, 'string');
      assert.equal(password.split('$').length, 4);
    });

    it('without password', async () => {
      await assert.rejects(() => Auth.createPassword());
    });
  });

  describe('async register()', () => {
    it('with credentials', async () => {
      const email = 'test@example.com';
      const name = 'Tester';
      const password = 'somepassword';

      await Auth.register({ email, name, password });
    });

    it('with existing user', async () => {
      const email = 'user@test.com';
      const name = 'Test account';
      const password = 'Letmein123';

      await Auth.register({ email, name, password });

      // Should throw as user should already be registered
      await assert.rejects(() => Auth.register({ email, name, password }));
    });

    it('without credentials', async () => {
      await assert.rejects(() => Auth.register());
    });
  })

  describe('async login()', () => {
    beforeEach(async () => {
      const db = await mongo.connect('users');
      const email = 'user@test.com';
      const name = 'Test account';
      const password = await Auth.createPassword('Letmein123');

      await db.insertOne({ email, name, password });
    });

    it('with valid credentials', async () => {
      const token = await Auth.login('user@test.com', 'Letmein123');

      assert.ok(isJWT(token));
    });

    it('with invalid user', async () => {
      return assert.rejects(() => Auth.login('hello@world.xz', 'S3cr3tP455w0rd'));
    });

    it('with invalid password', async () => {
      return assert.rejects(Auth.login('user@test.com', 'OpenSesame'));
    });

    it('without any credentials', async () => {
      return assert.rejects(() => Auth.login());
    });
  });
});

