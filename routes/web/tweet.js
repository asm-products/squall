module.exports = function(app, constants, request, twit) {
    app.post('/tweet', app.auth.isAuthenticated, function(req, res) {

      var API_URL = 'https://upload.twitter.com/1.1/media/upload.json';
      var image = req.body.image.replace(/^data.*base64,/, '');

        // First we post to media/upload.json
        request.post(API_URL, {
            oauth: {
                consumer_key: constants.Twitter.KEY,
                consumer_secret: constants.Twitter.SECRET,
                token: req.user.access_token,
                token_secret: req.user.access_token_secret
            },
            form: {
                media: image
            },
            json: true
            }, function (err, response, body) {
                var T = new twit({
                    consumer_key: constants.Twitter.KEY,
                    consumer_secret: constants.Twitter.SECRET,
                    access_token: req.user.access_token,
                    access_token_secret: req.user.access_token_secret
                });

                T.post('statuses/update', {
                    status: req.body.message || "",
                    media_ids: body.media_id_string
                }, function(err, data, response) {
                    var tweet_id = data.id_str;
                    T.get('statuses/oembed', { id: tweet_id }, function(err, data, response) {
                    req.user.tweet_ids.push('https://twitter.com/' + req.user.username + '/status/' + tweet_id);

                    });
            });
        });
    });
}