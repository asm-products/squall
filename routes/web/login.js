
module.exports = function(app, constants, passport) {
    app.get('/login', passport.authenticate('twitter'));

    app.get(constants.Twitter.CALLBACK,
        passport.authenticate('twitter', {
          successRedirect: '/dashboard',
          failureRedirect: '/'
        })
    );
}