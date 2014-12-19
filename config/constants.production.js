var Constants = {
  Cookie_Secret: process.env.COOKIE_SECRET,
  // Key and secret used to connect to twitter app, can't be shared
  Twitter: {
    KEY: process.env.TWITTER_KEY,
    SECRET: process.env.TWITTER_SECRET,
    CALLBACK: process.env.TWITTER_CALLBACK,
  },
  MongoURL: process.env.MONGOLAB_URI,
  RedisURL: process.env.REDISTOGO_URL
};

module.exports = Constants;
