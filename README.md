Textshots
========

Hacking The Tweetstorm... With Pictures of Text

## Built With

- Node.js
- Express.js
- MongoDB
- Twitter
- Jade
- Jquery

## Running

### Development

Make `config/constants.js` (see `config/constants.production.js` for format.)

to make the constants.js file for local development, see this example.  Note this is for LOCAL DEVELOPMENT ONLY.

```js
var Constants = {
  Cookie_Secret: "ANY RANDOM STRING",
  // Key and secret used to connect to twitter app, can't be shared
  Twitter: {
    KEY: "A VALID TWITTER API KEY",
    SECRET: "A VALID TWITTER SECRET",
    CALLBACK: "ANY STRING WILL SUFFICE, I USED '/auth/twitter/callback'",
  },
  Imgur: {
    ID: "A VALID IMGUR ID",
    SECRET: "A VALID IMGUR SECRET"
  },
  MongoURL: "mongodb://localhost/local",
  RedisURL: "redis://localhost:6379"
};
```

Things you need to do:
  - Go to apps.twitter.com and create a test app.  Use the KEY and SECRET they give you in your constants file.
  - Similarly create a legitimate IMGUR app and use the keys they give you.
  - Run MONGO locally.  The URL I used should also work for you.
  - Run REDIS locally.  My URL should work for you also; the port might differ however.
  - Install Grunt `npm install -g grunt-cli`
  - Run `grunt --force watch` (this will automatically rebuild your application.min.js when you make changes to script.js.)

Then run

    $ node bin/www

### Production

- Set the appropriate environment variables (see `config/constants.production.js`).
- Set `NODE_ENV` to `production`.
- Push/Deploy.

## About

This is a product being built by the Assembly community. You can help push this idea forward by visiting [https://assembly.com/textshots](https://assembly.com/textshots).
