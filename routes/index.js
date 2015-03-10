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


module.exports = function(app, constants, passport) {

    var Users = require('../models/users.js');
    var Posts = require('../models/posts.js');
    var getSlug = require('speakingurl');
    var request = require('request');
    var twit = require('twit');
    app.auth = {};

    app.auth.isAuthenticated = function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("authenticated")
            return next();
        }
        else {
            console.log("Failed authentication")
        }
        res.redirect('/');
    }

    app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    else {
        return res.render('landing');
        }
    });

    app.get('/error', function(req, res) {
        return res.render('squall');
    });
    //web path
    require("./web/login")(app, constants, passport);
    require("./web/logout")(app);
    require("./web/leaderboard")(app, Users);
    require("./web/profile")(app);
    require("./web/posts")(app, getSlug);
    require("./web/dashboard")(app, Posts, Users);
    require("./web/settings")(app, Users);
    require("./web/tweetpost")(app, constants, twit, getSlug, Posts, request);
    require("./web/tweet")(app, constants, request, twit);
    require("./web/imgur")(app, constants, request);
    require("./web/createfriendship")(app, twit);
    //:username path
    require("./username/follow")(app, Users, twit);
    require("./username/followers")(app, constants, Posts, Users);
    require("./username/following")(app, Posts, Users);
    require("./username/post")(app, constants, Posts, Users, twit);
    require("./username/unfollow")(app, Users);
    require("./username/user")(app, constants, Posts, Users, twit);

};