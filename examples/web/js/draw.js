(function($){
  var canvas = document.getElementById('drawCanvas')
    , context = canvas.getContext("2d")
    ;

  function draw(x, y, lx, ly) {
      context.beginPath();
      context.moveTo(lx, ly);
      context.lineTo(x, y);
      context.closePath();
      context.stroke();
  };

  display.onPixel(function(m) {
    draw(m.x, m.y, m.lx, m.ly);
  });

  $(canvas).mousedown(function(e) {
    var lastX = e.offsetX
      , lastY = e.offsetY
      ;

    $(canvas).mousemove(function(e) {
      var x = e.offsetX
        , y = e.offsetY
        ;

      display.pixel(x, y, lastX, lastY);
      draw(x, y, lastX, lastY);

      lastX = x;
      lastY = y;
    });

    $(canvas).bind('mouseup', function(){
      $(canvas).unbind('mousemove');
      lastX = null;
      lastY = null;
    });
  });
})(jQuery);
