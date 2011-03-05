var dgram = require('dgram')
  , events = require('events')
  , inherits = require('sys').inherits
  , hexy = require('hexy').hexy
  ;

DEBUG = false;
exports.DEBUG = DEBUG

// constants for convenience
exports.WRITE = 3;

// to be cleaned up some day ;)
function getPacket() {
    // get the needed buffer length
    var len = 0;
    for (x in arguments) {
        arg = arguments[x];
        if (arg.length)
            len += arg.length;
        else
            len += 2;
    } 
    // create the buffer
    var buf = new Buffer(len);

    // fill the buffer with data
    var i = 0;
    for (x in arguments) {
        arg = arguments[x];
        if (typeof arg === 'number') {
            x1 = arg % 256;
            x2 = Math.floor(arg/256);
            buf.write(String.fromCharCode(x1) + String.fromCharCode(x2), i);
            i += 2;
        }
        else {
            // it's a data string
            if (arg.length > 0) {
                buf.write(arg, i);
            } else {
                buf.write('\0', i);
            }
            i += arg.length;
        }
    }

    return buf;
}

function Display(config) {
    self = this
    // configuration
    if (!config) config = {};

    // config
    self.address = config.address || "172.23.42.120";
    self.port    = config.port    || 2342;
    self.waitcount = 0;

    // create the socket

    events.EventEmitter.call(this);
};
inherits(Display, events.EventEmitter);

// send a raw string
Display.prototype.send = function(buf) {
    self = this;

    if (self.waitcount == 0)
        self.sock = dgram.createSocket("udp4");
    else {
        setTimeout(function() { self.send(buf) }, 1);
        return;
    }
    var sent = 0;
    self.sock.send(buf, 0, buf.length, self.port, self.address, function(err) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log("Display sent to " + self.address + ": ");
        console.log(hexy(buf));
        self.waitcount += 1;
        console.log('waitcount: ' + self.waitcount);

        self.sock.on("message", function (msg, rinfo) {
            console.log("Display got the following from " + rinfo.address);
            console.log(hexy(msg));

            self.waitcount -= 1;
            console.log("waitcount: " + self.waitcount);

            if (self.waitcount <= 0)
                self.sock.close();

            if (msg[0] != buf[0]) {
                self.send(buf);
            }
            sent = true;
        });
        setTimeout(function() {
            if (sent) return;
            self.waitcount -= 1;
            if (self.waitcount <= 0) {
                self.sock.close();
            }
            self.send(buf);
        }, 100);
    });
};

// send a request to the display
Display.prototype.request = function(req) {
    // TODO if (req.resend === undefined) req.resend = true;
    if (req.cmd === undefined) throw 'cmd is undefined';
    if (req.data === undefined) req.data = '';
    if (req.x === undefined) req.x = 0;
    if (req.y === undefined) req.y = 0;
    if (req.w === undefined) req.w = req.data.length;
    if (req.h === undefined) req.h = 1;

    console.log(JSON.stringify(req));

    buf = getPacket(req.cmd, req.x, req.y, req.w, req.h, req.data);
    this.send(buf);
}

// set exports
exports.Display = Display;
