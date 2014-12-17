var express = require('express');
var router = express.Router();
var passport = require('passport');
var constants = require('./../config/constants.js');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

/* GET home page. */
router.get('/', function(req, res) {
  // if (req.isAuthenticated()) {
  //   return res.redirect('/dashboard');
  // }
  res.render('index');
});

router.get('/login', passport.authenticate('twitter'));

router.get(constants.Twitter.CALLBACK,
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/'
    })
);

router.get('/dashboard', isAuthenticated, function(req, res) {
  res.render('dashboard');
});

module.exports = router;
