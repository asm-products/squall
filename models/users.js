var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    unique: true
  },
  old_username: {
    type: String,
    unique: true
  },
  name: String,
  twId: String,
  photo: String,
  access_token: String,
  access_token_secret: String,
  tweet_ids: [],
  email_address: String,
  following: [],
  alert_when_friends_join: Boolean,
  alert_when_follow: Boolean,
  followerCount: {type: Number, default: 0},
  viewScore: {type: Number, default: 0}
});

userSchema.method("isFollowing", function(otherUser){
  return this.following.indexOf(otherUser.username) >= 0;
});

userSchema.method("addView", function() {
  var _this = this;
  _this.viewScore +=1;
  _this.save();
});

userSchema.method("addFollower", function(otherUser, callback){
  otherUser.following.addToSet(this.username);

  var _this = this;

  otherUser.save(function(err) {
    if (err) {
      return callback(err);
    }
    _this.followerCount += 1;

   _this.save(function(err){
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
});

userSchema.method("removeFollower", function(otherUser, callback){
  otherUser.following.pull(this.username);

  var _this = this;
  otherUser.save(function(err) {
    if(err) {
      return callback(err)
    }
    _this.followerCount -= 1;
    _this.save(function(err) {
      if(err){
        callback(err)
      }
      return callback();
    });
  });
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;
