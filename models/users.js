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
  following: []
});

userSchema.method("isFollowing", function(otherUser){
    return this.following.indexOf(otherUser.id) >= 0;
});

module.exports = mongoose.model('Users', userSchema);
