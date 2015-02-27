var express = require('express');
var router = express.Router();
var passport = require('passport');
var Users = require('../models/users.js');
var Posts = require('../models/posts.js');
var getSlug = require('speakingurl');

if (process.env.NODE_ENV === 'production') {
    var constants = require('./../config/constants.production.js');
} else {
    var constants = require('./../config/constants.js');
}
var request = require('request');
var twit = require('twit');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("authenticated")
    return next();
  }
  else {
    console.log("Failed authentication")
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

router.get('/profile', isAuthenticated, function(req, res) {
  var username = req.user.username;
  res.redirect('/'+username);
})

router.get('/dashboard', isAuthenticated, function(req, res) {
  res.render('dashboard', { username: req.user.username });
});

router.get('/posts/:post_id', function(request, response, next) {
  var post_id = request.params.post_id;
  var post = Posts.findOne({slug: post_id},
    function(err, result) {
      if (err) {
        response.json({status: "No Post Found"});
      }
      else {
        if (result)
          {
            var title = result.title;
            var author = result.author;
            var contents = result.content;
            var author_link = '../'+author;
            response.render('post', {title: title, contents: contents, author: author, author_link: author_link});
          }
        else {
          //return error page
          response.json({status: "Post not found"});
        }
      }
  });
});

router.post('/posts', function(request, response) {  //ADD AUTHENTICATION HERE OF COURSE

  var title = request.body.title;
  var content = request.body.content;
  var author = request.body.author;
  var slug = getSlug(title);

  var max_content_length = 1000;
  if (content.length <= max_content_length) {
    var post = new Posts({
      title: title,
      content: content,
      author: author,
      slug: slug
    });

    post.save(function(err, post) {
      if (err)
      {
        response.json({passed: false, message: "Unknown Failure"});
        return console.error(err);
      }
      else
      {
        response.json({passed: true, message: "Post created", slug: slug});
      }
      console.dir(post);
    });

  }
  else {
    response.json({passed: false, message: "Post too long"})
  }
});

router.post('/twitter/createfriendship', isAuthenticated, function(req, res) {
  var T = new twit({
    consumer_key: constants.Twitter.KEY,
    consumer_secret: constants.Twitter.SECRET,
    access_token: req.user.access_token,
    access_token_secret: req.user.access_token_secret
  });

  T.post('friendships/create', {
    screen_name: req.body.username
  }, function(err, data, response) {
    if (err) {
      console.log(err)
    }
  });
})

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

router.get('/:username', isAuthenticated, function(req, res, next) {
  var username = req.params.username
  var currentUser = null;
  if(req.isAuthenticated()){
      currentUser = req.user;
  }

  Users.findOne({ username : username }, function(err, existingUser) {
    if (existingUser) {
      //var posts = Posts.where('author').equals(existingUser.name).select('slug');

      Posts.find({author: existingUser.username}, function (err, result) {
        var posts = result

        return res.render('user_profile', { user: existingUser,
                                            large_photo: existingUser.photo.replace(/_normal/i, ''),
                                            posts: posts,
                                            currentUser: currentUser
                                            });
      })
    }

    if (err) {
      // something bad happened
      return done(err);
    }
  });
});

router.post('/:username/follow', isAuthenticated, function(req, res, next) {
  var username = req.params.username;

  Users.findOne({ username: username }, function(err, user) {
    if(err) {
      res.status(500).json({message: 'Unknown Failure'});
      return console.error(err);
    }

    if(user) {
      req.user.following.addToSet(user.id);

      req.user.save(function(err) {
        if(err) {
          res.status(500).json({message: 'Unknown Failure'});
          return console.error(err);
        }

        return res.json({message: "Following @"+username});
      });
    }

    else {
      return res.status(404).json({message: "User @"+username+" Not Found"});
    }

  });
});

router.post('/:username/unfollow', isAuthenticated, function(req, res, next) {
  var username = req.params.username;

  Users.findOne({ username: username }, function(err, user) {
    if(err) {
      res.status(500).json({message: 'Unknown Failure'});
      return console.error(err);
    }

    if(user) {
      req.user.following.pull(user.id);

      req.user.save(function(err) {
        if(err) {
          res.status(500).json({message: 'Unknown Failure'});
          return console.error(err);
        }

        return res.json({message: "No Longer Following @"+username});
      });
    }

    else {
      return res.status(404).json({message: "User @"+username+" Not Found"});
    }

  });
});

module.exports = router;
