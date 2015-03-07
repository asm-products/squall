Squall.io
=======

Hacking The Tweetstorm... With Pictures of Text

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

modules.exports = Constants;
```

Things you need to do:
  - Go to [http://apps.twitter.com](http://apps.twitter.com) and create a test app.  Use the KEY and SECRET they give you in your constants file.
  - Similarly create a legitimate IMGUR app and use the keys they give you.
  - Run MONGO locally.  The URL I used should also work for you.
  - Run REDIS locally.  My URL should work for you also; the port might differ however.
  - Install Grunt `npm install -g grunt-cli`
  - Run `grunt --force watch` (this will automatically rebuild your application.min.js when you make changes to script.js.)

Then run

    $ node bin/www

### Run using Docker

#### If using OSX or Windows
  - [Install Boot2Docker](http://boot2docker.io/)
  - Run Boot2Docker
    - $ `boot2docker init`
    - $ `boot2docker start`
    - $ `$(boot2docker shellinit)`
    - To persist the environment variables across shell sessions, you can add `$(boot2docker shellinit)` to your `~/.bashrc` file

#### If using Linux (Ubuntu)
  - Install from your favorite package manager
    - $ `sudo apt-get install docker.io`

#### Installing Fig
  - [Install Fig](http://www.fig.sh/install.html)
    - ``$ curl -L https://github.com/docker/fig/releases/download/1.0.1/fig-`uname -s`-`uname -m` > /usr/local/bin/fig; chmod +x /usr/local/bin/fig``
  - Get the Twitter and Imgur API key and secret and set them in constants.js
  - Set MongoURL as `"mongodb://" + process.env.MONGODB_PORT_27017_TCP_ADDR + "/local",`
  - Set RedisURL as `"redis://" + process.env.REDIS_PORT_6379_TCP_ADDR + ":6379"`
  - Build the Docker containers
    - $ `fig build`
  - Run the app
    - $ `fig up web`
  - Access the app locally
    - OSX/Windows: Run `boot2docker ip` to get the ip address of the Docker daemon
    - View the app at `IP_ADDRESS:3000`. If using Linux, go to `localhost:3000`


### Production

- Set the appropriate environment variables (see `config/constants.production.js`).
- Set `NODE_ENV` to `production`.
- Push/Deploy.

## About

This is a product being built by the Assembly community. You can help push this idea forward by visiting [https://assembly.com/squall](https://assembly.com/squall).
