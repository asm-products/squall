var checked = true;
var credit_text = "Tweeted using Storming.ME";
var TCO_LENGTH = 23;
var IMAGE_LINK_LENGTH = 23;
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
  $.post('/tweet', { image: $('#image').attr('src'), message: $('#textArea').val() }, function(data) {
    $('.tweetresult').css('display', 'block');
    $('.tweetresult').find('.embed').html(data);
    $('.tweet-button').text('Tweet');
    $('.tweet-button').removeClass('disabled');
  });

  var title = $('textArea').val();
  var content = document.getElementById('t').textContent;
  var author = $('#profileUsername').text()

  var bodydata = { title: String(title), content: String(content), author:  String(author) }


  $.post('/posts', {
    title: title,
    content: content,
    author: author
  })

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
  $('.text-length').text(IMAGE_LINK_LENGTH + length + '/140');
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


$('.bookmark').click(function(e) {
  alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
});


$('.followperson').click(function() {
  var username = $('#profileUsername').text();
  $.post('/'+username+"/follow")
  //$.post('/twitter/createfriendship', {username: username})
})
