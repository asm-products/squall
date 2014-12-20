var express = require('express');
var router = express.Router();
var passport = require('passport');
if (process.env.NODE_ENV === 'production') {
    var constants = require('./../config/constants.production.js');
} else {
    var constants = require('./../config/constants.js');
}
var request = require('request');
var twit = require('twit');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

router.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
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
  res.render('dashboard', { username: req.user.username });
});

router.post('/tweet', isAuthenticated, function(req, res) {
  var API_URL = 'https://upload.twitter.com/1.1/media/upload.json';

  var image = req.body.image.replace(/^data.*base64,/, '');

  // First we post to media/upload.json
  request.post(API_URL, {
    oauth: {
      consumer_key: constants.Twitter.KEY,
      consumer_secret: constants.Twitter.SECRET,
      token: req.user.access_token,
      token_secret: req.user.access_token_secret
    },
    form: {
      media: image
    },
    json: true
  }, function (err, response, body) {
    var T = new twit({
      consumer_key: constants.Twitter.KEY,
      consumer_secret: constants.Twitter.SECRET,
      access_token: req.user.access_token,
      access_token_secret: req.user.access_token_secret
    });

    T.post('statuses/update', {
      status: req.body.message || "",
      media_ids: body.media_id_string
    }, function(err, data, response) {
      console.log(data.id_str);
      T.get('statuses/oembed', { id: data.id_str }, function(err, data, response) {
        res.send(data.html);
      });
    });
  });
});

module.exports = router;
