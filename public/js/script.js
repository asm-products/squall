var checked = true;
var credit_text = "Tweeted using Storming.ME";
var TCO_LENGTH = 23;
var IMAGE_LINK_LENGTH = 23;
var font = "Lato";
var timer;


$('.login-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Login');
});

$('.example-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Example');
});

$('.why-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Why Medium');
});


$('.textBox').keyup(function() {
  clearTimeout(timer);

  timer = setTimeout(function() {
      draw();
  }, 300); // wait for 300ms after each keystroke
});


$(window).resize(function() {
  clearTimeout(timer);

  timer = setTimeout(function() {
      draw();
  }, 200); // wait for 200ms
});


function draw() {
  html2canvas(document.getElementById('t'), {
    allowTaint: true,
    onrendered: function(canvas) {
      document.getElementById('image').src = canvas.toDataURL();
    }
  });
}


$('.tweet-button').click(function() {
  $('.tweet-button').text('Posting your tweetstorm...');
  $('.tweetresult').css('display', 'none');
  ga('send', 'event', 'Dashboard', 'Click', 'Tweet', $('.textBox').text().length);
  $('.tweet-button').addClass('disabled');
  $.post('/tweet', { image: $('#image').attr('src'), message: $('#textArea').val() }, function(data) {
    console.log(data);
    $('.tweetresult').css('display', 'block');
    $('.tweetresult').find('.embed').html(data);
    $('.tweet-button').text('Post Tweetstorm as Picture');
    $('.tweet-button').removeClass('disabled');
  });
});


$('#credit').click(function() {
  var $this = $(this);
  checked = $this.is(':checked');
  if (checked) {
    $('.textBox').after('<div class="credit-preview">' + credit_text + '</div>');
  } else {
    $('.panel-body').find('.credit-preview').remove();
  }
  draw();
});


$('#font').click(function() {
  var $this = $(this);
  checked = $this.is(':checked');
  if (checked) {
    font = 'Merriweather';
  } else {
    font = 'Lato';
  }
  $('.panel-body').css('font-family', font);
  draw();
});


$('#textArea').keyup(function() {
  var text = $(this).val();
  var splits = text.split(' ');
  geturl = new RegExp("(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g");
  var length = 0;

  for (var i = 0; i < splits.length; i++) {
    if (splits[i].match(geturl) && splits[i].length > TCO_LENGTH) {
      // it's a url and under max length
      length += TCO_LENGTH;
    } else {
      length += splits[i].length;
    }
  }
  $('.text-length').text(IMAGE_LINK_LENGTH + length + '/140');
});


$(".textBox").on('paste', function(){
  console.log('paste');
  setTimeout(function() {
    var text = $('.textBox').text();
    $(".textBox").text(text);
  }, 50);
});
