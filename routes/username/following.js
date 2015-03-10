module.exports = function(app, Posts, Users) {
        app.get('/:username/following', function(req,res,next) {

        var username = req.params.username
        var currentUser = null;

        if(req.isAuthenticated()){
            currentUser = req.user;
        }

        var post_count = Posts.find({author: req.user.username}, function(err, rt) {
            c = rt.length;
            var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
                var g = userlist.map(function(q) {return q.username} );
                var b = g.indexOf(req.user.username) + 1;
                Users.findOne({ username : username }, function(err, existingUser) {
                    if (existingUser) {
                        Users.find({username: {$in : [existingUser.following] }}, function(err, following) {
                        return res.render('following',
                        { 
                            user: existingUser,
                            following: following,
                            large_photo: existingUser.photo,
                            rank: b,
                            post_count: c})
                        })
                        if (err) {
                            // something bad happened
                            console.log(err);
                            return done(err);
                        }
                    };
                });
             });

        });
    });

}