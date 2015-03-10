module.exports = function(app){

	app.get('/profile', app.auth.isAuthenticated, function(req, res) {
	  var username = req.user.username;
	  res.redirect('/'+username);
	})
};