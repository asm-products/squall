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

if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

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
  else {
    return res.render('landing');
  }
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
  var c = 0;
  var post_count = Posts.find({author: req.user.username}, function(err, rt) {
    c = rt.length;
    Users.find({username: {$in : [req.user.following] }}, function(err, following) {
      var f = following.map(function(a) {return a.username})
      var au = following.map(function(b) {return b.photo})
      var avatar_urls = {}
      for(i = 0; i < f.length; i++) {
        avatar_urls[f[i]] = au[i];
      }

      f.push(req.user.username)
      avatar_urls[req.user.username] = req.user.photo

      var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
        var g = userlist.map(function(q) {return q.username} );
        var b = g.indexOf(req.user.username) + 1;
        Posts.find({author: { $in : f.getUnique()}}, null, {sort: {created_at: -1}}, function(err, result) {
          return res.render('dashboard', { user: req.user,
                                              large_photo: req.user.photo.replace(/_normal/i, ''),
                                              posts: result,
                                              post_count: c,
                                              avatar_urls: avatar_urls,
                                              rank: b
                                              });
        })
      })
    })
  })
});

router.get('/leaderboard', function(req, res) {
  var leader_limit = process.env.LEADER_LIMIT;
  var top_users = Users.find({}).sort({viewScore: -1}).limit(leader_limit).exec(function(err, leaders) {
    if (leaders) {
      var p=0;
    }
    else {
      leaders = [];
    }
    res.render('leaderboard', {
      leaders: leaders
    })
})
})

router.get('/settings', isAuthenticated, function(req, res) {
  return res.render('user_settings', { user: req.user });

});

router.post('/settings', isAuthenticated, function(req, res) {
  req.user.email_address = req.body.email
  req.user.alert_when_friends_join = req.body.alert_when_friends_join
  req.user.alert_when_follow = req.body.alert_when_follow
  req.user.save()
  return res.json({passed: true});
});

router.get('/error', function(req, res) {
  return res.render('squall');
})

router.post('/posts', isAuthenticated, function(request, response) {
  var title = request.body.title;
  var content = request.body.content;
  var author = request.body.author;
  var slug = getSlug(title);

  var max_content_length = 2000;
  if (content.length <= max_content_length) {
    var post = new Posts({
      title: title,
      content: content,
      author: author,
      slug: slug,
      viewCount: 0
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
  console.log("creating friendship with ")
  console.log(req.body.username)
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

router.get('/:username/followers', function(req, res, next) {
  var username = req.params.username
  var currentUser = null;
  if(req.isAuthenticated()){
      currentUser = req.user;
  }

  var post_count = Posts.find({author: req.user.username}, function(err, rt) {
    c = rt.length;

    var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
      var g = userlist.map(function(q) {return q.username} );
      var b = g.indexOf(req.user.username) + 1;

      Users.findOne({ username : username }, function(err, existingUser) {
        if (existingUser) {
          Posts.find({author: existingUser.username}, null, {sort: {date: -1}}, function (err, posts) {
            var title = existingUser.name + " (@" + existingUser.username + ")";
            var description = title + " profile page";
            var image = existingUser.photo.replace(/_normal/i, '')
            var url = constants.BaseUrl + "/" + username;

            var followers = Users.find({ following : { $in : [username] }}, function(err, followers) {

              return res.render('followers', { user: existingUser,
                followers: followers,
                large_photo: image,
                posts: posts,
                currentUser: currentUser,
                title: title,
                description: description,
                image: image,
                url: url,
                twitterCreator: "@" + username,
                openGraphType: "profile",
                ogOtherData: {
                  "profile:username": username,
                },
                rank: b,
                post_count: c
              });
            })
          });
        }
        if (err) {
          // something bad happened
          return done(err);
        }
      });
    })

  })


})

router.get('/:username/following', function(req,res,next) {
    var username = req.params.username
    var currentUser = null;
    if(req.isAuthenticated()){
        currentUser = req.user;
    }

    var post_count = Posts.find({author: req.user.username}, function(err, rt) {
      c = rt.length;
      var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
        var g = userlist.map(function(q) {return q.username} );
        var b = g.indexOf(req.user.username) + 1;
        Users.findOne({ username : username }, function(err, existingUser) {
          if (existingUser) {
            Users.find({username: {$in : [existingUser.following] }}, function(err, following) {
              return res.render('following',
                { user: existingUser,
                  following: following,
                  large_photo: existingUser.photo,
                  rank: b,
                  post_count: c})
            })
          if (err) {
            // something bad happened
            console.log(err);
            return done(err);
          }
        };
        })
      })

    })
})

router.post('/tweetpost', isAuthenticated, function(req, res) {
  var title = req.body.title;
  var content = req.body.content;
  var author = req.body.author;
  var htmlcontent = req.body.htmlcontent
  var slug = getSlug(title);

  // CREATE POST OBJECT
  var max_content_length = 2000;
  if (content.length <= max_content_length) {
    var post = new Posts({
      title: title,
      content: String(htmlcontent),
      author: author,
      slug: slug,
      viewCount: 0
    });
    post.save();
  }

  //CONSTRUCT MESSAGE
  var url = "http://squall.io/"+author+"/" + slug;
  console.log(url);
  var end_message = url + " @Squallapp"
  console.log(end_message)
  var n = 60;
  console.log(n)
  var message = title;
  if (message.length>n) {
    message = message.substring(0,n)
  }
  message = message + " " + end_message;
  console.log(message)

  //TWEET IMAGE
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
      status: message || "",
      media_ids: body.media_id_string
    }, function(err, data, response) {
      if(data) {
        var tweet_id = data['id_str'];
        T.get('statuses/oembed', { id: tweet_id }, function(err, data, response) {
          req.user.tweet_ids.push('https://twitter.com/' + req.user.username + '/status/' + tweet_id);

          Posts.find({slug: slug}, function(err, pr) {
            if (pr) {
              if (pr.length > 0) {
                pr[0].tweet_ids.push(tweet_id);
                pr[0].save();
              }
            }
          })
        });
      }
    });
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

      });
    });
  });
});

router.post('/upload/imgur', isAuthenticated, function(req, res) {

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
  var currentUser = null;
  if(req.isAuthenticated()){
      currentUser = req.user;
  }

  var post_count = Posts.find({author: username}, function(err, rt) {
    c = rt.length;
    var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
      var g = userlist.map(function(q) {return q.username} );
      var b = g.indexOf(username) + 1;
      Users.findOne({ username : username }, function(err, existingUser) {
        if (err) {
          // something bad happened
          console.log(err);
          return res.redirect('/error');
        }

        if (existingUser) {
          Posts.find({author: existingUser.username}, null, {sort: {created_at: -1}}, function (err, posts) {
            var title = existingUser.name + " (@" + existingUser.username + ")";
            var description = title + " profile page";
            var image = existingUser.photo.replace(/_normal/i, '')
            var url = constants.BaseUrl + "/" + username;

            return res.render('user_profile', { user: existingUser,
              large_photo: image,
              posts: posts,
              currentUser: currentUser,
              title: title,
              description: description,
              image: image,
              url: url,
              twitterCreator: "@" + username,
              openGraphType: "profile",
              ogOtherData: {
                "profile:username": username,
              },
              rank: b,
              post_count: c
            });
          });
        }
        else {
          // no such user
          next(); // will 404 if no other matching route
        }

      });


    })

  })




});

router.post('/:username/follow', isAuthenticated, function(req, res, next) {
  var username = req.params.username;

  Users.findOne({ username: username }, function(err, user) {
    if(err) {
      res.status(500).json({message: 'Unknown Failure'});
      return console.error(err);
    }

    if(user) {
      user.addFollower(req.user, function(err){
          if(err){
            res.status(500).json({message: 'Unknown Failure'});
            return console.log(err);
          }
          return res.json({message: "Following @"+username});
      });

      var T = new twit({
        consumer_key: constants.Twitter.KEY,
        consumer_secret: constants.Twitter.SECRET,
        access_token: req.user.access_token,
        access_token_secret: req.user.access_token_secret
      });

      T.post('friendships/create', {
        screen_name: username
      }, function(err, data, response) {
        if (err) {
          console.log(err)
        }
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
      user.removeFollower(req.user, function(err){
          if(err){
              res.status(500).json({message: 'Unknown Failure'});
              return console.error(err)
          }
          return res.json({message: 'No longer following @'+username+'.'});
      });
    }

    else {
      return res.status(404).json({message: "User @"+username+" Not Found"});
    }

  });
});

router.get('/:username/:post_id', function(request, response) {
  var post_id = request.params.post_id;
  var username = request.params.username

  var user = Users.findOne({username: username}, function (err, u) {
    if (u) {
      var avatar_url = u.photo;

      u.addView();

      var post = Posts.findOne({slug: post_id, author: username}, function(err, result) {
        if (err) {
          console.log(err);
          response.redirect('/error');
        }
        else {
          if (result)
            {

              var title = result.title;
              var author = result.author;
              var contents = result.content;
              var author_link = '../'+author;
              var author_user = u;

              if (isNaN(result.viewCount)) {
                var newViewCount = 1;
              }
              else {
                var newViewCount = result.viewCount + 1;
              }
              result.viewCount = newViewCount;
              result.save();

              if(request.user) {
                var T = new twit({
                  consumer_key: constants.Twitter.KEY,
                  consumer_secret: constants.Twitter.SECRET,
                  access_token: request.user.access_token,
                  access_token_secret: request.user.access_token_secret
                });

                var tweet_id = result.tweet_ids;
                if (tweet_id.length > 0) {   //WE HAVE A TWEET ID FOR THIS POST
                  creation_tweet_id = tweet_id[0];

                  T.get('statuses/oembed', { id: creation_tweet_id, hide_media: true, hide_thread: true }, function(err, data, reser) {
                    if(data) {
                      response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result, tweet: data.html});
                    }
                    else {
                      response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
                    }

                  });

                }
                else {   // WE DONT HAVE A TWEET ID FOR THIS POST, INCLUDE NO TWITTER CONTENT
                  response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
                }
              }
              else {
                response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
              }


              }

            else {
              //return error page
              response.redirect('/error');
            }
        }
      })
    }
    else{
      response.redirect('/error');
    }
  })

})

module.exports = router;
