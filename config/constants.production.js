var Constants = {
  Cookie_Secret: process.env.COOKIE_SECRET,
  // Key and secret used to connect to twitter app, can't be shared
  Twitter: {
    KEY: process.env.TWITTER_KEY,
    SECRET: process.env.TWITTER_SECRET,
    CALLBACK: process.env.TWITTER_CALLBACK,
  },
  Imgur: {
    ID: process.env.IMGUR_ID,
    SECRET: process.env.IMGUR_SECRET
  },
  MongoURL: process.env.MONGOLAB_URI,
  RedisURL: process.env.REDISTOGO_URL,
  BaseUrl: "http://squarrel.io"
};

module.exports = Constants;
