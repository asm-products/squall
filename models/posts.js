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
  title: {
    type: String,
    unique: true
  },
  content: String,
  tweet_ids: [],
  slug: {
    type: String,
    unique: true
  },
  viewCount: Number
});

module.exports = mongoose.model('Posts', postSchema);
