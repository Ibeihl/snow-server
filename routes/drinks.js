'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Drink = require('../models/drinks');



router.get('/', (req, res, next) => {
    const { search } = req.query;
    console.log(req.query); 

    if (search) {
        const re = new RegExp(search, 'i');
        let filter = { 'name': re }

        Drink.find(filter)
            .sort({name: 'asc'})
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
    const { name, method, eggWhite, glass, ingredients, instructions } = req.body;
    const newDrink = {name, method, eggWhite, glass, ingredients, instructions};

    Drink.create(newDrink)
        .then(result => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => next(err));

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