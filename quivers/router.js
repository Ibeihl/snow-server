'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Quiver = require('./models');
const router = express.Router();
const passport = require('passport');

router.use('/', passport.authenticate('jwt', {session: false, failWithError: true }));
//-------GET by username-----------------------------//
router.get('/:username', (req, res, next) => {
    const username = req.params.username;
    Quiver.findOne({username})
        .then(skiAreas => {
            res.json(skiAreas)
        })
        .catch(err => next(err));
});


//-------PUT endpoint to add/remove skiArea------------//
router.put('/:username', (req, res, next) => {
    const username = req.params.username;
    const { action, skiArea } = req.body;
    let update;
    if (action === "add") {
        update = {
            $push: {skiAreas: skiArea}
        }
    } else if (action === "remove") {
        update = {
            $pull: { skiAreas: { $in: skiArea } }
        }
    }

    Quiver.findOneAndUpdate({username}, update, {new: true})
        .then(userQuiver => {
            res.json(userQuiver)
        })
        .catch(err => next(err));

})

module.exports = { router };