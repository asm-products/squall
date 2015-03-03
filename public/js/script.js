var checked = true;
var credit_text = ", Tweeted using @squallapp";
var TCO_LENGTH = 23;
var IMAGE_LINK_LENGTH = 40;
var font = "Lato";
var timer;

rangy.init();

function Highlighter() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.textContent = 'H';
    this.button.onclick = this.onClick.bind(this);
    this.classApplier = rangy.createCssClassApplier("highlight", {
        elementTagName: 'mark',
        normalize: true
    });
}
Highlighter.prototype.onClick = function() {
    this.classApplier.toggleSelection();
    draw();
};
Highlighter.prototype.getButton = function() {
    return this.button;
};
Highlighter.prototype.checkState = function (node) {
    if(node.tagName == 'MARK') {
        this.button.classList.add('medium-editor-button-active');
    }
};


var editor = new MediumEditor('.editable', {
  buttons: ['highlight', 'bold', 'italic', 'underline', 'quote', 'header1',
            'superscript', 'subscript', 'unorderedlist'],
  cleanPastedHTML: true,
  buttonLabels: 'fontawesome',
  extensions: {
    'highlight': new Highlighter()
  }
});


$('.login-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Login');
});

$('.example-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Example');
});

$('.why-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Why Medium');
});

$('.editable').on('input', function() {
  draw();
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
  $('.tweet-button').text('Posting tweet...');
  $('.tweetresult').css('display', 'none');
  $('.tweet-button').addClass('disabled');
  ga('send', 'event', 'Dashboard', 'Click', 'Tweet', $('.textBox').text().length);

  var title = $('textArea').val();
  if(title.length === 0) {
    title = "My Post";
    console.log("too short");
    console.log(title);
  }

  var content = document.getElementById('t').textContent;
  var htmlcontent = $('#m').html().toString();
  var author = $('#profileUsername').text();

  $.post('/tweetpost', { image: $('#image').attr('src'), title: String(title), htmlcontent: htmlcontent, content: String(content), author: String(author) }, function(data) {
    $('.tweetresult').css('display', 'block');
    $('.tweetresult').find('.embed').html(data);
    $('.tweet-button').text('Tweet');
    $('.tweet-button').removeClass('disabled');
  });
});


$('.upload-imgur').click(function() {
  $('.tweet-button').text('Uploading image...');
  $('.tweetresult').css('display', 'none');
  $('.tweet-button').addClass('disabled');
  ga('send', 'event', 'Dashboard', 'Click', 'Imgur Upload');
  $.post('/upload/imgur', { image: $('#image').attr('src') }, function(data) {
    if (data === 'error') {
      alert('Could not upload image');
    } else {
      $('.tweetresult').css('display', 'block');
      $('.tweetresult').find('h4').text('Image Uploaded');
      $('.tweetresult').find('.embed').html(
          '<div class="form-control-wrapper"><input class="form-control ' +
          'empty upload-link" readonly value="' + data + '" type="text"><span ' +
          'class="material-input"></span></div>');
    }
    $('.tweet-button').text('Tweet');
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
  $('.text-length').text( length + '/100');
  if($('#textArea').text().length > 100){
    $('#textArea').text($('#textArea').text().substring(0,99));
  }

});

$('#t').keyup(function() {
  var post_length = $('#t').text().length;
  if (post_length > 10000) {
    $('#t').text($('#t').text().substring(0,9999));
  }
  $('.post-length').text(post_length +' / 10000');
});

$(".upload-link").focus(function() {
  this.select();
});

$('.rand-bg-btn').click(function() {
  var color = randomColor({
     luminosity: 'light'
  });
  $('.panel-body').css('background-color', color);
  draw();
});

//Catching this event on the body means that we don't have to re-attach click handlers when swapping ids.
$("body").on("click", "#follow, #unfollow", function(event) {
  var btn = $(event.target);
  var username = btn.attr("data-username");
  btn.prop("disabled", true);
  console.log("posting");
  $.post('/'+username+"/"+btn.attr("id"), {}, function(){
      btn.toggleClass("btn-info btn-danger").prop("disabled", false);
      if(btn.hasClass("btn-info")){
        btn.text("Follow");
      }else{
        btn.text("Unfollow");
      }
  });
});

$('#settings-form').submit(function(e) {
  $('#success-alert').addClass("hide");
  $('#error-alert').addClass("hide");
  var params = $('#settings-form').serializeJSON();
  $.post('/settings', params, function(data) {
    if (data.passed) {
      $('#success-alert').removeClass("hide");
    } else {
      $('#error-alert').html(data.errors);
      $('#error-alert').removeClass("hide");
    }
  });
  e.preventDefault();
});
