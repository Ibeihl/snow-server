'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Drink = require('../models/drinks');

//TEST GET ENDPOINT
router.get('/', (req, res, next) => {
    const { search } = req.query;
    console.log(search);
    
    if(search){
        const re = new RegExp(search, 'i');
        let filter = { 'name': re }

        Drink.find(filter)
        .then(drinks => {
            console.log(drinks);
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