'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const Drink = require('../models/drinks');

const seedDrinks = require('../db/seed/drinks');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Drink.insertMany(seedDrinks)
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
