module.exports = function(app, Users, twit) {
    app.post('/:username/follow', app.auth.isAuthenticated, function(req, res, next) {
        var username = req.params.username;

        Users.findOne({ username: username }, function(err, user) {
            if(err) {
                res.status(500).json({message: 'Unknown Failure'});
                return console.error(err);
            }

            if(user) {
                user.addFollower(req.user, function(err){
                if(err){
                    res.status(500).json({message: 'Unknown Failure'});
                    return console.log(err);
                }
                    return res.json({message: "Following @"+username});
                });

                var T = new twit({
                    consumer_key: constants.Twitter.KEY,
                    consumer_secret: constants.Twitter.SECRET,
                    access_token: req.user.access_token,
                    access_token_secret: req.user.access_token_secret
                });

                T.post('friendships/create', {
                    screen_name: username
                }, function(err, data, response) {
                    if (err) {
                      console.log(err)
                    }
                });

            }
            else {
                return res.status(404).json({message: "User @"+username+" Not Found"});
            }
        });
    });
}