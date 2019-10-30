const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const Auth = require('../../lib/auth');
const mongo = require('../../db');

const app = require('../../app');
const server = app.listen(0);

chai.should();
chai.use(chaiHttp);

describe('Authentication routes', () => {
  before(async () => {
    // Create users collection
    const db = await mongo.connect();
    const users = await db.createCollection('users');

    await users.createIndex('email');
  });

  beforeEach(async () => {
    await Auth.register({
      email: 'tester@test.com',
      name: 'Test User',
      password: 'Opensesame123',
    });
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
    server.close();
  });

  describe('POST /login', () => {
    it('with existing user', done => {
      chai.request(server)
        .post('/login')
        .send({
          email: 'tester@test.com',
          password: 'Opensesame123'
        })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          res.body.token.should.be.a('string');

          done();
        });
    });

    it('with nonexistent user', done => {
      chai.request(server)
        .post('/login')
        .send({
          email: 'hello@somewebsite.com',
          password: 'Tota11ysecure'
        })
        .end((ex, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('without credentials', done => {
      chai.request(server)
        .post('/login')
        .end((ex, res) => {
          res.should.have.status(500);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });

  describe('POST /register', () => {
    it('with existing user', done => {
      chai.request(server)
        .post('/register')
        .send({
          email: 'tester@test.com',
          name: 'New User',
          password: 'My_p4ssword',
        })
        .end((ex, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('with nonexisting user', done => {
      chai.request(server)
        .post('/register')
        .send({
          email: 'me@test.com',
          name: 'Me Tester',
          password: 'Let_me_in',
        })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('without credentials', done => {
      chai.request(server)
        .post('/register')
        .end((ex, res) => {
          res.should.have.status(500);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });
});

describe('Authentication middleware', () => {
  // We use a random route using the authentication middleware
  // So we can test that wrongful authentications doesn't get accepted
  it('Without authentication header', done => {
    chai.request(server)
      .post('/balance')
      .end((ex, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.message.should.be.a('string');

        done();
      });
  });

  it('With invalid authentication type', done => {
    chai.request(server)
      .post('/balance')
      .set('Authorization', 'Hello not_a_real_token')
      .end((ex, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.message.should.be.a('string');

        done();
      });
  });

  it('Without token', done => {
    chai.request(server)
      .post('/balance')
      .set('Authorization', 'Bearer')
      .end((ex, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.message.should.be.a('string');

        done();
      });
  });

  it('With invalid token', done => {
    chai.request(server)
      .post('/balance')
      .set('Authorization', 'Bearer still_not_a_real_token')
      .end((ex, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.message.should.be.a('string');

        done();
      });
  });
});
