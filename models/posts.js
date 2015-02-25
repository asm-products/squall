var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now
  },
  tweeted_at: {
    type: Date,
    default: Date.now
  },
  author: String,
  title: String,
  content: String,
  tweet_ids: [],
  slug: String
});

module.exports = mongoose.model('Posts', postSchema);
