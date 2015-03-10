module.exports = function(app, constants, Posts, Users) {
    app.get('/:username/followers', function(req, res, next) {
        var username = req.params.username;
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
                        Posts.find({author: existingUser.username}, null, {sort: {date: -1}}, function (err, posts) {
                            var title = existingUser.name + " (@" + existingUser.username + ")";
                            var description = title + " profile page";
                            var image = existingUser.photo.replace(/_normal/i, '')
                            var url = constants.BaseUrl + "/" + username;

                            var followers = Users.find({ following : { $in : [username] }}, function(err, followers) {

                                return res.render('followers', { user: existingUser,
                                    followers: followers,
                                    large_photo: image,
                                    posts: posts,
                                    currentUser: currentUser,
                                    title: title,
                                    description: description,
                                    image: image,
                                    url: url,
                                    twitterCreator: "@" + username,
                                    openGraphType: "profile",
                                    ogOtherData: {
                                        "profile:username": username,
                                    },
                                    rank: b,
                                    post_count: c
                                });
                            })
                        });
                    }
                    if (err) {
                      // something bad happened
                      return done(err);
                    }
                });
            });

        });


    });
}