var display;

(function($){
  Display = function() {
    var self = this;

    self.socket = new io.Socket(null, {port: location.port, rememberTransport: false});
    self.socket.connect();

    self.socket.on('message', function(msg){
      for (key in msg) {
        m = msg[key];
        switch (key) {
          case 'welcome':
            $('#debug').text('Connected :)');
            break;
          case 'error':
            $('#debug').text('Error: ' + m);
            break;
          default:
            break;
        }
      }
    });

    self.socket.on('error', function(err) {
      $('#debug').text('Error!');
    });
  }

  Display.prototype.clear = function(){
    this.socket.send({request: {cmd: 2}});
    this.socket.send({request: {cmd: 7, data: String.fromCharCode(7)}});
  }

  Display.prototype.request = function(req){
    this.socket.send({request: req});
  }

  // export
  display = new Display();
})(jQuery)
