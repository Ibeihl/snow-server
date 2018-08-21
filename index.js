'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const drinksRouter = require('./drinks/router');

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

//create express app
const app = express();

//parse request body
app.use(express.json());


console.log(CLIENT_ORIGIN);

//cross origin middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

//morgan logger middleware
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);


// app.use(function(req, res, next) {
//   res.header(“Access-Control-Allow-Origin”, “*”);
//   res.header(“Access-Control-Allow-Headers”, “Origin, X-Requested-With, Content-Type, Accept”);
//   next();
//  });

//auth strategies
passport.use(localStrategy);
passport.use(jwtStrategy);

//serve static page
// app.use(express.static(???))

//mount routers
app.use('/api/drinks', drinksRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
// app.use(passport.authenticate('jwt', {session: false, failWithError: true }))

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
