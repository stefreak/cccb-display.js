var display;

(function($){
  Display = function() {
    var self = this
      , canvas = $('#canvas')
      ;

    self.socket = new io.Socket(null, {port: location.port, rememberTransport: false});
    self.socket.connect();
    
    self.socket.on('message', function(msg){
      console.log(msg);
      for (key in msg) {
        m = msg[key];
        switch (key) {
          case 'welcome':
            $('#debug').text('Connected. Click into the canvas to draw on the display :)');
            break;
          case 'pixel':
            //drawCanvasPixel(pos.x, pos.y);
            break;
          case 'error':
            $('#debug').text('Error!');
            break;
          default:
            break;
        }
      }
    });

    self.socket.on('error', function(err) {
      $('#debug').text('Error!');
    });

    canvas.mousemove(function(e) {
      self.socket.send({pixel: {x: e.pageX, y:e.pageY}});
    }, false);
  }

  Display.prototype.clear = function(){
    this.socket.send({request: {cmd: 2}});
    this.socket.send({request: {cmd: 7, data: String.fromCharCode(7)}});
  }

  Display.prototype.request = function(req){
    this.socket.send({request: req});
  }

  $(document).ready(function(){
    display = new Display();
  });
})(jQuery)
