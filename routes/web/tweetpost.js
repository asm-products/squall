module.exports = function(app, constants, twit, getSlug, Posts, request) {
    app.post('/tweetpost', app.auth.isAuthenticated, function(req, res) {
        var title = req.body.title;
        var content = req.body.content;
        var author = req.body.author;
        var htmlcontent = req.body.htmlcontent
        var slug = getSlug(title);

      // CREATE POST OBJECT
        var max_content_length = 2000;
        if (content.length <= max_content_length) {
            var post = new Posts({
                title: title,
                content: String(htmlcontent),
                author: author,
                slug: slug,
                viewCount: 0
            });
            post.save();
        }

      //CONSTRUCT MESSAGE
        var url = "http://squall.io/"+author+"/" + slug;
        console.log(url);
        var end_message = url + " @SquallApp"
        console.log(end_message)
        var n = 60;
        console.log(n)
        var message = title;
        if (message.length>n) {
            message = message.substring(0,n)
        }
        message = message + " " + end_message;
        console.log(message)

        //TWEET IMAGE
        var API_URL = 'https://upload.twitter.com/1.1/media/upload.json';
        var image = req.body.image.replace(/^data.*base64,/, '');

        // First we post to media/upload.json
        request.post(API_URL, {
            oauth: {
                consumer_key: constants.Twitter.KEY,
                consumer_secret: constants.Twitter.SECRET,
                token: req.user.access_token,
                token_secret: req.user.access_token_secret
            },
        form: {
            media: image
        },
            json: true
        }, function (err, response, body) {
            var T = new twit({
                consumer_key: constants.Twitter.KEY,
                consumer_secret: constants.Twitter.SECRET,
                access_token: req.user.access_token,
                access_token_secret: req.user.access_token_secret
            });

            T.post('statuses/update', {
                status: message || "",
                media_ids: body.media_id_string
            }, function(err, data, response) {
                if(data) {
                    var tweet_id = data['id_str'];
                    T.get('statuses/oembed', { id: tweet_id }, function(err, data, response) {
                        req.user.tweet_ids.push('https://twitter.com/' + req.user.username + '/status/' + tweet_id);

                        Posts.find({slug: slug}, function(err, pr) {
                            if (pr) {
                                if (pr.length > 0) {
                                    pr[0].tweet_ids.push(tweet_id);
                                    pr[0].save();
                                }
                            }
                        })
                    });
                }
            });
        });

    })
}