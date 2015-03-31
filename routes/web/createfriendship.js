module.exports = function(app, twit) {
    app.post('/twitter/createfriendship', app.auth.isAuthenticated, function(req, res) {
        console.log("creating friendship with ")
        console.log(req.body.username)
        var T = new twit({
            consumer_key: constants.Twitter.KEY,
            consumer_secret: constants.Twitter.SECRET,
            access_token: req.user.access_token,
            access_token_secret: req.user.access_token_secret
        });

        T.post('friendships/create', {
            screen_name: req.body.username
        }, function(err, data, response) {
            if (err) {
                console.log(err)
            }
        });
    })
}