module.exports = function(app, Users){
    app.post('/:username/unfollow', app.auth.isAuthenticated, function(req, res, next) {
        var username = req.params.username;

        Users.findOne({ username: username }, function(err, user) {
            if(err) {
                res.status(500).json({message: 'Unknown Failure'});
                return console.error(err);
            }

            if(user) {
                user.removeFollower(req.user, function(err){
                    if(err){
                        res.status(500).json({message: 'Unknown Failure'});
                        return console.error(err)
                }
                return res.json({message: 'No longer following @'+username+'.'});
                });
            }
            else {
                return res.status(404).json({message: "User @"+username+" Not Found"});
            }
        });
    });
}