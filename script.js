var canvas = $("#e");
var context = canvas.getContext("2d");
var message = "";


$('#textBox').keydown(function(e) {
    textBoxChanged(e);
});


function textBoxChanged(e) {
    var target = e.target;
    message = target.value;
    drawScreen();
}


function drawScreen() {
    context.clearRect (0, 0, canvas.width, canvas.height);
    var metrics = context.measureText(message);
    var textWidth = metrics.width;
    var xPosition = (canvas.width / 2) - (textWidth / 2);
    var yPosition = (canvas.height / 2);

    context.fillText(message, xPosition, yPosition);

    var img = canvas.toDataURL("image/png");
    $('#h').html('<img src="'+img+'"/>');
}
