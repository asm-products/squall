var express = require('express');
var router = express.Router();
var passport = require('passport');
<<<<<<< HEAD
var Users = require('../models/users.js');
var Posts = require('../models/posts.js');
=======
var Users = require('./../models/users');
>>>>>>> f4138242d274a15b58e1ace06ab56e85e75f4be4

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
  res.render('landing');
});

router.get('/login', passport.authenticate('twitter'));

router.get(constants.Twitter.CALLBACK,
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/'
    })
);

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/dashboard', isAuthenticated, function(req, res) {
  res.render('dashboard', { username: req.user.username });
});

router.get('/users/:user_id', function(req, res, next) {
  // gets the value for the named parameter user_id from the url
  var user_id = req.params.user_id;

  var user = Users.findOne({ twId : user_id });
  res.json(user.twId);
});

router.get('/posts/:post_id', function(request, response, next) {
  var post_id = request.params.post_id;
  var post = Posts.findOne({title: post_id},
    function(err, result) {
      if (err) {
        response.json({status: "No User Found"});
      }
      else {
        var title = post.title;
        var author = post.author;
        var contents = post.contents;
        response.render('post', {title: title, contents: contents, author: author});
      }
  });
});

router.post('/posts', function(request, response) {  //ADD AUTHENTICATION HERE OF COURSE

  var title = request.body.title;
  var content = request.body.content;
  var author = request.body.author;
  console.log(request.body.title);
  console.log("here");
  console.log(request);

  console.log(title);
  console.log(content);
  console.log(author);

  var post = new Posts({
    title: title,
    content: content,
    author: author
  });

  // post.save(function(err, post) {
  //   if (err) return console.error(err);
  //   console.dir(post);
  // });


  response.json({status: "Post Created"});
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
      var tweet_id = data.id_str;
      T.get('statuses/oembed', { id: tweet_id }, function(err, data, response) {
        req.user.tweet_ids.push('https://twitter.com/' + req.user.username + '/status/' + tweet_id);
        req.user.save(function(err, u) {
          res.send(data.html);
        });
      });
    });
  });
});

router.post('/upload/imgur', function(req, res) {

  var img = req.body.image.replace(/^data:image\/(png|jpg);base64,/, '');
  var options = {
    url: 'https://api.imgur.com/3/image',
    method: 'POST',
    body: {
      image: img,
      type: 'base64',
    },
    json: true,
    headers: {
     'Authorization': 'Client-ID ' + constants.Imgur.ID
    }
  }

  request.post(options, function(err, response, body) {
    if (err) {
      return res.send('error');
    }

    return res.send(body.data.link);
  });
});

router.get('/:username', function(req, res, next) {
  var username = req.params.username
  // var user;

  Users.findOne({ username : username }, function(err, existingUser) {
    if (existingUser) {
      // found existing user
      // user = existingUser;
      return res.render('user_profile', { user: existingUser,
                                          large_photo: existingUser.photo.replace(/_normal/i, '') });
    }

    if (err) {
      // something bad happened
      return done(err);
    }
    res.redirect('/');
  });

  // if (user){
  //   res.render('user_profile', { user: user });
  // } else {
  //   res.redirect('/');
  // }
});

module.exports = router;
