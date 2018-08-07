'use strict';

const express = require('express');
const mongoose = require('mongoose');
const drinks = require('../drinks');
const router = express.Router();

//TEST GET ENDPOINT
router.get('/', (req, res, next) => {
    const { search } = req.query;
    console.log(search);
    
    if(search){
      const drinkResults = drinks.filter(drink => drink.includes(search))
      return res.json(drinkResults)
    }
  
    res.json(drinks);
  })
  
  router.get('/', (req, res, next) => {
    const { search } = req.query;
    console.log(search);
    
    if(search){
      const drinkResults = drinks.filter(drink => drink.includes(search))
      return res.json(drinkResults)
    }
  
    res.json(drinks);
  })
  



  module.exports = router;