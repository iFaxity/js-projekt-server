const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const Auth = require('../../lib/auth');
const mongo = require('../../db');

const app = require('../../app');
let server = app.listen(0);
let token;

chai.should();
chai.use(chaiHttp);

describe('General routes', () => {
  before(async () => {
    const db = await mongo.connect();
    const depot = await db.createCollection('depot');
    const users = await db.createCollection('users');

    await users.createIndex('email');

    // Prices won't change as websocket is turned off in testing
    await depot.insertMany([
      { _id: 'item_1', price: 10 },
      { _id: 'item_2', price: 5 },
    ]);
    await users.insertOne({
      email: 'user@website.com',
      name: 'John Doe',
      password: 'Bananbr0d', // We don't need password to be secure
      balance: 100,
      depot: { item_2: 3 },
    });

    // Create dummy token to use in some routes
    token = await Auth.createToken({ email: 'user@website.com' });
  });

  afterEach(async () => {
    const users = await mongo.connect('users');

    await users.updateOne({ email: 'user@website.com' }, {
      $set: { balance: 100, depot: { item_2: 3 } },
    });
  });

  after(async () => {
    // Ensure users are deleted after test is done
    const db = await mongo.connect();

    await db.dropCollection('users');
    await db.dropCollection('depot');
    await mongo.close();
    server.close();
  });

  describe('GET /', () => {
    it('Authorized', done => {
      chai.request(server)
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data.balance.should.be.a('number');
          res.body.data.depot.should.be.an('array');
          res.body.data.depot.should.have.lengthOf(2);
          res.body.data.depot[0].amount.should.be.a('number');
          done();
        });
    });

    it('Unauthorized', done => {
      chai.request(server)
        .get('/')
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data.depot.should.be.an('array');
          res.body.data.depot.should.have.lengthOf(2);
          res.body.data.depot[0].should.not.have.property('amount');
          done();
        });
    });
  });

  describe('POST /buy', () => {
    it('Authorized', done => {
      chai.request(server)
        .post('/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 'item_1', amount: 7 })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data.balance.should.be.a('number');
          res.body.data.balance.should.equal(30);
          res.body.data.amount.should.be.a('number');
          res.body.data.amount.should.equal(7);
          done();
        });
    });

    it('Unauthorized', done => {
      chai.request(server)
        .post('/buy')
        .send({ id: 'item_1', amount: 5 })
        .end((ex, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });

  describe('POST /sell', () => {
    it('Authorized', done => {
      chai.request(server)
        .post('/sell')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 'item_2', amount: 2 })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data.balance.should.be.a('number');
          res.body.data.balance.should.equal(110);
          res.body.data.amount.should.be.a('number');
          res.body.data.amount.should.equal(1);
          done();
        });
    });

    it('Unauthorized', done => {
      chai.request(server)
        .post('/sell')
        .send({ id: 'item_2', amount: 1 })
        .end((ex, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });

  describe('POST /balance', () => {
    it('Authorized', done => {
      chai.request(server)
        .post('/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 23, })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          res.body.data.balance.should.equal(123);
          done();
        });
    });

    it('Unauthorized', done => {
      chai.request(server)
        .post('/balance')
        .send({ amount: 40, })
        .end((ex, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          done();
        });
    });
  });
});
