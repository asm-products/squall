module.exports = function(app, constants, request) {
    app.post('/upload/imgur', app.auth.isAuthenticated, function(req, res) {

        var img = req.body.image.replace(/^data:image\/(png|jpg);base64,/, '');
        var options = {
            url: 'https://api.imgur.com/3/image',
            method: 'POST',
            body: {
            image: img,
            type: 'base64',
            },
            json: true,
            headers: {
                'Authorization': 'Client-ID ' + constants.Imgur.ID
            }
        }

        request.post(options, function(err, response, body) {
        if (err) {
            return res.send('error');
        }

            return res.send(body.data.link);
        });
    });

}