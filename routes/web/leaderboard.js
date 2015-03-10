module.exports = function(app, Users) {
    app.get('/leaderboard', function(req, res) {
        var leader_limit = process.env.LEADER_LIMIT;
        var top_users = Users.find({}).sort({viewScore: -1}).limit(leader_limit).exec(function(err, leaders) {
            if (leaders) {
                var p=0;
            }
            else {
                leaders = [];
            }
            res.render('leaderboard', {
                leaders: leaders
            })
        })
    });
}