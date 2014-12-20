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
  tweet_ids: []
});

module.exports = mongoose.model('Users', userSchema);
