var express = require('express');
var router = express.Router();
var passport = require('passport');
var constants = require('./../config/constants.js');

router.get('/', passport.authenticate('twitter'));

router.get(constants.Twitter.CALLBACK,
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/'
    })
);

module.exports = router;
