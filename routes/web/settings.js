module.exports = function(app, Users) {

    app.get('/settings', app.auth.isAuthenticated, function(req, res) {
        return res.render('user_settings', { user: req.user });

    }); 

    app.post('/settings', app.auth.isAuthenticated, function(req, res) {
        req.user.email_address = req.body.email;
        req.user.alert_when_friends_join = req.body.alert_when_friends_join;
        req.user.alert_when_follow = req.body.alert_when_follow;

    var new_username = req.body.username;

    if (!new_username) {
    return res.json({errors: ['Username cannot be empty.']});
    }

    if (req.user.old_username) {
    return res.json({errors: ['Username cannot be changed more than once.']});
    }

    if (new_username === req.user.username) {
    return res.json({errors: ['New Username cannot be same as existing username.']});
    }

    // make sure new username is available
    Users.findOne({ $or: [ { username : new_username }, { old_username : new_username } ]}, function(err, existingUser) {

        if (err) {
            return res.json({errors: ['Something went wrong.']});
        }

        if (existingUser) {
            // send error
            return res.json({errors: ['Username has been taken.']});
        } else {
            req.user.old_username = req.user.username;
            req.user.username = req.body.username;
            req.user.save();
            return res.json({passed: true});
        }
    });

    });

}