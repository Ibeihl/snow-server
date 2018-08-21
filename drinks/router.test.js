'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app } = require('../index');
const Drink = require('./models');
const { User } = require('../users/models');
const seedDrinks = require('../db/drinks');
const seedUsers = require('../db/users');

const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
const expect = chai.expect;

let token;
let user;

describe('Cocktail Buddy API - Drinks', function () {

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      Drink.insertMany(seedDrinks),
      Drink.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      })
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/drinks', function () {

    it('should return a list sorted by name with the correct number of drinks', function () {
      return Promise.all([
        Drink.find()
            // .where('user').in([user.username, 'classic'])
            .sort('name'),
        chai.request(app).get('/api/drinks').set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
            console.log(res.status);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct fields and values', function () {
      return Promise.all([
        Drink.find()
            .where('user').in([user.username, 'classic'])
            .sort('name'),
        chai.request(app).get('/api/drinks').set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.have.all.keys('id', 'name', 'ingredients', 'method', 'eggWhite',
                'instructions', 'favorites', 'user');
            expect(item.id).to.equal(data[i].id);
            expect(item.name).to.equal(data[i].name);
          });
        });
    });

  });

  describe('POST /api/drinks', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = { 
          name: 'newDrink',
          method: 'shaken',
          eggWhite: 'no',
          ingredients: [ 'liquor' ],
          user: 'aUser',
          instructions: 'mix it up',
          glass: 'coupe'
       };
      let body;
      return chai.request(app)
        .post('/api/drinks').set('Authorization', `Bearer ${token}`)
        .send({newDrink: newItem})
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.have.all.keys('id', 'name', 'method', 'eggWhite', 'ingredients',
            'user', 'favorites', 'instructions', 'glass');
          return Drink.findById({_id: body.id});
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(body.method).to.equal(data.method);
          expect(body.instructions).to.equal(data.instructions);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = { 'foo': 'bar' };
      return chai.request(app)
        .post('/api/drinks').set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when given a duplicate name', function () {
      return Folder.findOne({ userId: user.id })
        .then(data => {
          const newItem = { name: data.name };
          return chai.request(app).post('/api/drinks').set('Authorization', `Bearer ${token}`).send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Drink name already exists');
        });
    });

  });

  describe('PUT /api/folders/:id', function () {

    it('should update the folder', function () {
      const updateItem = { name: 'Updated Name' };
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).set('Authorization', `Bearer ${token}`).send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          // expect item to have been updated
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });


    it('should respond with a 400 for an invalid id', function () {
      const updateItem = { name: 'Blah' };
      return chai.request(app)
        .put('/api/folders/NOT-A-VALID-ID').set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      const updateItem = { name: 'Blah' };
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      return chai.request(app)
        .put('/api/folders/DOESNOTEXIST').set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {};
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).set('Authorization', `Bearer ${token}`).send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when given a duplicate name', function () {
      return Folder.find({ userId: user.id }).limit(2)
        .then(results => {
          const [item1, item2] = results;
          item1.name = item2.name;
          return chai.request(app)
            .put(`/api/folders/${item1.id}`).set('Authorization', `Bearer ${token}`)
            .send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Folder name already exists');
        });
    });

  });

  describe('DELETE /api/folders/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`).set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Folder.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .delete('/api/folders/NOT-A-VALID-ID').set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });

});
