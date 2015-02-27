
$('.tweetpost').click(function() {

  $('.tweetpost').text('Posting tweet...');

  var message = "Check out this post"

  $.post('/tweet', { image: $('#image').attr('src'), message: message }, function(data) {
    // $('.tweetresult').css('display', 'block');
    // $('.tweetresult').find('.embed').html(data);
    // $('.tweetpost').removeClass('disabled');
    $('.tweetpost').text('Your Tweet is Betwotten ');
  });
});


function draw() {
  html2canvas(document.getElementById('t'), {
    allowTaint: true,
    onrendered: function(canvas) {
      document.getElementById('image').src = canvas.toDataURL();
    }
  });
}

window.onload = draw();
