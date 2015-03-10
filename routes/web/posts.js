module.exports = function(app) {
    app.post('/posts', app.auth.isAuthenticated, function(request, response) {
    var title = request.body.title;
    var content = request.body.content;
    var author = request.body.author;
    var slug = getSlug(title);

    var max_content_length = 2000;
    if (content.length <= max_content_length) {
        var post = new Posts({
            title: title,
            content: content,
            author: author,
            slug: slug,
            viewCount: 0
        });

        post.save(function(err, post) {
            if (err)
            {
                response.json({passed: false, message: "Unknown Failure"});
                return console.error(err);
            }
            else
            {
                response.json({passed: true, message: "Post created", slug: slug});
            }
            console.dir(post);
        });

    }
    else {
        response.json({passed: false, message: "Post too long"})
    }
});
}