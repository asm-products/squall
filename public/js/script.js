var canvas = document.getElementById("textCanvas");
var context = canvas.getContext('2d');

var emmeasure = context.measureText("M").width;
var spacemeasure = context.measureText(" ").width;

var checked = true;
var credit_text = "by Storming.ME";


$('#textCanvas').attr('width', $('.panel-body').width());

$('.textBox').keyup(function() {
  draw();
});

$(window).resize(function() {
  draw();
});


function draw() {
  var lines = fragmentText($('.textBox').text(), canvas.width * 0.8),
      font_size = 18;
  $('#textCanvas').attr('width', $('.panel-body').width());
  $('#textCanvas').attr('height', lines.length * (font_size + 5) + 100);
  context.font = font_size + "px sans-serif";
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = 'top';
  lines.forEach(function(line, i) {
    context.fillText(line, canvas.width * 0.1, (i + 1) * (font_size + 5));
  });
  if (checked) {
    context.fillText(credit_text,
                     canvas.width - (emmeasure * credit_text.length) - 40,
                     canvas.height - (font_size + 10));
  }
  document.getElementById('image').src = context.canvas.toDataURL();
  context.restore();
}


function fragmentText(text, maxWidth) {
  if (maxWidth < emmeasure) {
    throw "Can't fragment less than one character.";
  }

  if (context.measureText(text).width < maxWidth) {
    return [text];
  }

  var words = text.split(' '),
      metawords = [],
      lines = [];

  for (var w in words) {
    var word = words[w];
    var measure = context.measureText(word).width;

    if (measure > maxWidth) {
      var edgewords = (function(word, maxWidth) {
        var wlen = word.length;
        if (wlen == 0) return [];
        if (wlen == 1) return [word];

        var awords = [], cword = "", cmeasure = 0, letters = [];

        for (var l = 0; l < wlen; l++) {
          letters.push({
            "letter": word[l],
            "measure": context.measureText(word[l]).width
          });
        }

        for (var ml in letters) {
          var metaletter = letters[ml];

          if (cmeasure + metaletter.measure > maxWidth) {
            awords.push({
              "word": cword,
              "len": cword.length,
              "measure": cmeasure
            });
            cword = "";
            cmeasure = 0;
          }

          cword += metaletter.letter;
          cmeasure += metaletter.measure;
        }
        awords.push({
          "word": cword,
          "len": cword.length,
          "measure": cmeasure
        });
        return awords;
      })(word, maxWidth);

      for (var ew in edgewords) {
        metawords.push(edgewords[ew]);
      }
    } else {
      metawords.push({
        "word": word,
        "len": word.length,
        "measure": measure
      });
    }
  }

  var cline = "";
  var cmeasure = 0;
  for (var mw in metawords) {
    var metaword = metawords[mw];

    if ((cmeasure + metaword.measure > maxWidth) &&
         cmeasure > 0 && metaword.len > 1) {
      lines.push(cline)
      cline = "";
      cmeasure = 0;
    }

    cline += metaword.word;
    cmeasure += metaword.measure;

    if (cmeasure + spacemeasure < maxWidth) {
      cline += " ";
      cmeasure += spacemeasure;
    } else {
      lines.push(cline)
      cline = "";
      cmeasure = 0;
    }
  }
  if (cmeasure > 0) {
    lines.push(cline);
  }

  return lines;
}


$('.tweet-button').click(function() {
  $.post('/tweet', { image: $('#image').attr('src') }, function(data) {
    console.log(data);
  });
});


$('#credit').click(function() {
  var $this = $(this);
  checked = $this.is(':checked');
  draw();
});
