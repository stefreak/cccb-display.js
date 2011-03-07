var dgram = require('dgram')
  , events = require('events')
  , inherits = require('sys').inherits
  , hexy = require('hexy').hexy
  , chr = String.fromCharCode
  , default_callback = function(err){ if (err) throw err; }
  ;

DEBUG = false;
exports.DEBUG = DEBUG

// simple queue
function Queue() {
  this.q = new Array();
  events.EventEmitter.call(this);
};
inherits(Queue, events.EventEmitter);

Queue.prototype.get = function(callback) {
  var self = this
    , wait = true
    ;

  if (!callback) {
    wait = false;
    callback = function(item){ return item };
  }

  if (self.q.length > 0) {
    return callback(self.q.pop());
  }

  if (!wait) {
    return false;
  }

  self.once('item', function() {
    callback(self.q.pop());
  });
}

Queue.prototype.put = function(item) {
  this.q.unshift(item);
  this.emit('item');
}

function Display(config) {
  self = this
  // configuration
  if (!config) config = {};

  // config
  self.address = config.address || "172.23.42.120";
  self.port    = config.port    || 2342;
  self.linelen = config.linelen || 56;
  self.lines   = config.lines   || 20;

  // create the socket
  self.sock = dgram.createSocket("udp4");
  self.queue = new Queue();

  function encode(x) {
    x1 = x % 256;
    x2 = Math.floor(x/256);
    return chr(x1) + chr(x2);
  }

  function getPacket(d) {
    // create the buffer
    var buf = new Buffer(5*2 + d.data.length /* ? 1 : data.length */)
      , offset = 0
      , array = [d.cmd, d.x, d.y, d.w, d.h, d.data];
      ;

    // fill the buffer with data
    for (i in array) {
      x = array[i];

      if (typeof x === 'number') {
        buf.write(encode(x), offset);
        offset += 2;
        continue;
      }

      // it's a data string
      buf.write(x, offset);
    }

    return buf;
  }

  var sent
    , retry;
  function send(buf, resend, callback) {
    if (!callback) callback = default_callback;

    self.sock.send(buf, 0, buf.length, self.port, self.address, function(err) {
      //if (err) return callback(err);

      console.log("Display sent to " + self.address + ": ");
      console.log(hexy(buf));

      // wait for response
      self.sock.once("message", function(msg, rinfo) {
        console.log("Display got the following from " + rinfo.address);
        console.log(hexy(msg));
        sent = true;
        if (callback) setTimeout(callback, 0);
        self.emit('nextPacket');
      });

      // timeout
      setTimeout(function() {
        if (!sent) {
          self.sock.removeAllListeners("message");
          if (resend) {
            retry = true;
            send(buf, resend, callback);
          } else {
            if (callback) setTimeout(callback, 0, true);
            sent = true;
            self.emit('nextPacket');
          }
        }
      }, 1000);

    });
  }

  // inherits EventEmitter
  events.EventEmitter.call(this);

  // send packet
  self.on('nextPacket', function() {
    self.queue.get(function(array) {
      var data = array[0]
        , callback = array[1]
        , resend = data.resend
        , sent = retry = false
        , buf = getPacket(data)
        ;
      send(buf, resend, callback);
    });
  });

  // initiate the loop
  self.emit('nextPacket');
};
inherits(Display, events.EventEmitter);

// send a request to the display
Display.prototype.request = function(req, callback) {
  if (req.cmd === undefined) throw 'cmd is undefined';
  if (req.data === undefined) req.data = '';
  if (req.x === undefined) req.x = 0;
  if (req.y === undefined) req.y = 0;
  if (req.w === undefined) req.w = req.data.length;
  if (req.h === undefined) req.h = 1;

  console.log(JSON.stringify(req));

  this.queue.put([req, callback]);
}

Display.prototype.clear = function(callback) {
  // default callback
  if (!callback) callback = default_callback;

  // clear the display
  this.request({cmd: 2}, callback);

  // reset brightness
  this.request({cmd: 7, data: chr(5)}, callback);
}

// set exports
exports.Display = Display;
