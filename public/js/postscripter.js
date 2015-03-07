$(document).ready(function() {
  $('.sharepost').click(function() {
    $('.sharepost').text('Sharing Post...');
    draw();
    var author_name = $('.author-name').first().text();
    var url = document.URL;
    var message = "Check out this post by @"+author_name+" sent via @SquallApp "+url;

    $.post('/tweet', { image: $('#image').attr('src'), message: message }, function(data) {
      $('.sharepost').text('Tweeted!');
    });
  });



});

window.onload = draw;
