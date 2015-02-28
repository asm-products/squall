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
});

module.exports = mongoose.model('Users', userSchema);
