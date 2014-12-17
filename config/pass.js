var TwitterStrategy = require('passport-twitter').Strategy;

// bring in the schema for user
var Users = require('mongoose').model('Users'),
    Constants = require('./constants');

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    console.log('serializing: ' + user.username);
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserializing: ' + id);
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Logic for twitter strategy
  passport.use(new TwitterStrategy({
    consumerKey : Constants.Twitter.KEY,
    consumerSecret : Constants.Twitter.SECRET,
    callbackURL: Constants.Twitter.CALLBACK,
    passReqToCallback: true
  }, function(token, tokenSecret, profile, done) {
    console.log('twitter authentication for ' + profile.username);

    User.findOne({twId : profile.id}, function(err, oldUser) {
      if (oldUser) {
        // found existing user
        return done(null, oldUser);
      }

      if (err) {
        // something bad happened
        return done(err);
      }

      // If user doesn't exist create a new one
      var newUser = new User({
        twId: profile.id,
        username: profile.username,
        photo: profile.photos[0].value || '',
        access_token: token,
        access_token_secret: tokenSecret
      }).save(function(err, newUser) {
        if (err) throw err;
        return done(null, newUser);
      });
    });
  }));

}
