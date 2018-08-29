'use strict';

const mongoose = require('mongoose');

const quiverSchema = new mongoose.Schema({
    username: { type: String, required: true },
    skiAreas: [String]
});

quiverSchema.set('toObject', {
    virtuals: true,     // include built-in virtual `id`
    versionKey: false,  // remove `__v` version key
    transform: (doc, ret) => {
      delete ret._id; // delete `_id`
    }
  });

  module.exports = mongoose.model('Quiver', quiverSchema);