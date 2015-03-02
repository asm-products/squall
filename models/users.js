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
  name: String,
  twId: String,
  photo: String,
  access_token: String,
  access_token_secret: String,
  tweet_ids: [],
  email_address: String,
  following: [],
  alert_when_friends_join: Boolean,
  alert_when_follow: Boolean
  followerCount: {type: Number, default: 0}
});

userSchema.method("isFollowing", function(otherUser){
  return this.following.indexOf(otherUser.id) >= 0;
});

userSchema.method("addFollower", function(otherUser, callback){
  otherUser.following.addToSet(this.id);
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
  otherUser.following.pull(this.id);

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
