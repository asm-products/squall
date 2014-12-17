var express = require('express');
var router = express.Router();
var passport = require('passport');
var constants = require('./../config/constants.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', passport.authenticate('twitter'));

router.get(constants.Twitter.CALLBACK,
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/'
    })
);

router.get('/dashboard', function(req, res) {
  res.render('dashboard');
});

module.exports = router;
