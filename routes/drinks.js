'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Drink = require('../models/drinks');
// const User = require('../users/models');
const passport = require('passport');

// router.use('/', passport.authenticate('jwt', {session: false, failWithError: true }));
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.get('/', jwtAuth, (req, res, next) => {
    const { search, user, displayCat } = req.query;
    let filter;
    let userFilter;
    if (search) {
        const re = new RegExp(search, 'i');
        filter = {
            $or: [{ 'name': re }, { 'ingredients': re },
            { 'glass': re }, { 'instructions': re }]
        }
    }
    if (displayCat === 'userDrinks') {
        userFilter = user;
    }
    if (displayCat === 'classic') {
        userFilter = 'classic';
    }
    if (displayCat === 'all') {
        userFilter = [user, 'classic'];
    }
    if (displayCat === 'favorites') {
        Drink.find({ 'favorites': user })
            .sort({ 'name': 'asc' })
            .then(drinks => {
                res.json(drinks);
            })
            .catch(err => next(err));
    }
    Drink.find(filter)
        .where('user').in(userFilter)
        .sort({ 'name': 'asc' })
        .then(drinks => {
            res.json(drinks);
        })
        .catch(err => next(err));

})

//ADD a new drink
router.post('/', jwtAuth, (req, res, next) => {
    const { name, method, eggWhite, glass, ingredients, instructions, user } = req.body.newDrink;
    const newDrink = { name, method, eggWhite, glass, ingredients, instructions, user };
    newDrink.favorites = [];

    Drink.create(newDrink)
        .then(result => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => next(err));

})

//add favorite
router.put('/:id', jwtAuth, (req, res, next) => {
    const id = req.params.id
    const { user, favorite } = req.body;
    console.log(req.body);
    /***** Never trust users - validate input *****/
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }
    if (favorite) {
        let removeFav = {
            $pull: { favorites: { $in: user } }
        }
        Drink.findByIdAndUpdate(id, removeFav, { new: true })
            .then(result => {
                if (result) {
                    res.json(result);
                } else {
                    next();
                }
            })
    } else {
        let addFav = {
            $push: { favorites: user }
        };
        Drink.findByIdAndUpdate(id, addFav, { new: true })
            .then(result => {
                if (result) {
                    res.json(result);
                } else {
                    next();
                }
            })
    }

})


//delete
router.delete('/:id', jwtAuth, (req, res, next) => {
    const { id } = req.params;

    /***** Never trust users - validate input *****/
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    Drink.findByIdAndRemove(id)
        .then(() => {
            res.sendStatus(204);
        })
        .catch(err => {
            next(err);
        });

})

module.exports = router;