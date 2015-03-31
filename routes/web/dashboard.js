module.exports = function(app, Posts, Users) {
    app.get('/dashboard', app.auth.isAuthenticated, function(req, res) {
    var c = 0;
    var post_count = Posts.find({author: req.user.username}, function(err, rt) {
        c = rt.length;
        Users.find({username: {$in : [req.user.following] }}, function(err, following) {
            var f = following.map(function(a) {return a.username})
            var au = following.map(function(b) {return b.photo})
            var avatar_urls = {}
            for(i = 0; i < f.length; i++) {
                avatar_urls[f[i]] = au[i];
            }

        f.push(req.user.username)
        avatar_urls[req.user.username] = req.user.photo

        var my_rank = Users.find({}).sort({viewScore: -1}).exec(function(err, userlist) {
            var g = userlist.map(function(q) {return q.username} );
            var b = g.indexOf(req.user.username) + 1;
            Posts.find({author: { $in : f.getUnique()}}, null, {sort: {created_at: -1}}, function(err, result) {
                return res.render('dashboard', { user: req.user,
                                                large_photo: req.user.photo.replace(/_normal/i, ''),
                                                posts: result,
                                                post_count: c,
                                                avatar_urls: avatar_urls,
                                                rank: b
                                            });
          })
        })
      })
    })
  });
}