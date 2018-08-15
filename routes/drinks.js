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
    const { search, user } = req.query;
    console.log(req.query);

    if (search) {
        const re = new RegExp(search, 'i');
        let filter = {
            $and: [
                { $or: [{ 'user': user }, { 'user': 'classic' }] },
                {
                    $or: [{ 'name': re }, { 'ingredients': re },
                    { 'glass': re }, { 'instructions': re }]
                }
            ]
        }

        Drink.find(filter)
            .sort({ 'name': 'asc' })
            .then(drinks => {
                res.json(drinks);
            })
            .catch(err => next(err));
    } else {
        Drink.find()
            .then(drinks => {
                res.json(drinks);
            })
            .catch(err => next(err));
    }
})

router.post('/', (req, res, next) => {
    const { name, method, eggWhite, glass, ingredients, instructions, user } = req.body.newDrink;
    const newDrink = { name, method, eggWhite, glass, ingredients, instructions, user };

    Drink.create(newDrink)
        .then(result => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => next(err));

})

router.delete('/:id', (req, res, next) => {
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

//   router.get('/', (req, res, next) => {
//     const { search } = req.query;
//     console.log(search);

//     if(search){
//       const drinkResults = drinks.filter(drink => drink.includes(search))
//       return res.json(drinkResults)
//     }

//     res.json(drinks);
//   })




module.exports = router;