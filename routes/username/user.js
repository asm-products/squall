module.exports = function(app, constants, Posts, Users, twit) {
    app.get('/:username', function(req, res, next) {
        var username = req.params.username;
        var currentUser = null;
        if(req.isAuthenticated()){
            currentUser = req.user;
        }

        var post_count = Posts.find({author: username}, function(err, rt) {
            c = rt.length;
            var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
                var g = userlist.map(function(q) {return q.username} );
                var g2 = userlist.map(function(q) {return q.old_username || ''} );

                // merge the lists
                g.push.apply(g, g2);

                var b = g.indexOf(username) + 1;
                    Users.findOne({ $or: [ { username : username }, { old_username : username } ]}, function(err, existingUser) {
                    if (err) {
                        // something bad happened
                        console.log(err);
                        return res.redirect('/error');
                    }

                    if (existingUser) {

                        // if the request came through old username
                        if (existingUser.old_username && username === existingUser.old_username) {
                            return res.redirect('/' + existingUser.username);
                        }

                        Posts.find({author: existingUser.username}, null, {sort: {created_at: -1}}, function (err, posts) {
                            var title = existingUser.name + " (@" + existingUser.username + ")";
                            var description = title + " profile page";
                            var image = existingUser.photo.replace(/_normal/i, '')
                            var url = constants.BaseUrl + "/" + username;

                            return res.render('user_profile', { user: existingUser,
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
                        });
                    }
                    else {
                        // no such user
                        next(); // will 404 if no other matching route
                    }
                });
            })
        })
    });
}