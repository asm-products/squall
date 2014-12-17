var Constants = {
  // Key and secret used to connect to twitter app, can't be shared
  Twitter: {
    KEY: process.env.twitter_key || '',
    SECRET: process.env.twitter_secret || '',
    CALLBACK: process.env.twitter_callback || '/login/callback',
  },
  MongoURL: process.env.MONGOLAB_URI || '',
  RedisURL: process.env.REDISTOGO_URL || ''
};

module.exports = Constants;
