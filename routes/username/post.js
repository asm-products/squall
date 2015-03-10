module.exports = function(app, constants, Posts, Users, twit) {
    app.get('/:username/:post_id', function(request, response) {
        var post_id = request.params.post_id;
        var username = request.params.username

        var user = Users.findOne({ $or: [ { username : username }, { old_username : username } ]}, function (err, u) {
            if (u) {

            // if the request came through old username
                if (u.old_username && username === u.old_username) {
                    return response.redirect('/' + u.username + '/' + post_id);
                }

                var avatar_url = u.photo;

                u.addView();

                var post = Posts.findOne({slug: post_id, author: username}, function(err, result) {
                    if (err) {
                      console.log(err);
                      response.redirect('/error');
                    }
                    else {
                        if (result)
                        {

                            var title = result.title;
                            var author = result.author;
                            var contents = result.content;
                            var author_link = '../'+author;
                            var author_user = u;

                            if (isNaN(result.viewCount)) {
                                var newViewCount = 1;
                            }
                            else {
                                var newViewCount = result.viewCount + 1;
                            }
                            result.viewCount = newViewCount;
                            result.save();

                            if(request.user) {
                                var T = new twit({
                                    consumer_key: constants.Twitter.KEY,
                                    consumer_secret: constants.Twitter.SECRET,
                                    access_token: request.user.access_token,
                                    access_token_secret: request.user.access_token_secret
                                });

                                var tweet_id = result.tweet_ids;
                                if (tweet_id.length > 0) {   //WE HAVE A TWEET ID FOR THIS POST
                                    creation_tweet_id = tweet_id[0];

                                    T.get('statuses/oembed', { id: creation_tweet_id, hide_media: true, hide_thread: true }, function(err, data, reser) {
                                        if(data) {
                                            response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result, tweet: data.html});
                                        }
                                        else {
                                            response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
                                        }
                                    });

                                }
                                else {   // WE DONT HAVE A TWEET ID FOR THIS POST, INCLUDE NO TWITTER CONTENT
                                  response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
                                }
                            }
                            else {
                                response.render('post', {author_user: author_user, avatar_url: avatar_url, title: title, contents: contents, author: author, author_link: author_link, post: result});
                            }
                        }   
                        else {
                            //return error page
                            response.redirect('/error');
                        }
                    }
                })
            }
            else {
                response.redirect('/error');
            }
        })

    })
}