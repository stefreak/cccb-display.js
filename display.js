var dgram = require('dgram'),
    events = require('events'),
    async = require('async');
    inherits = require('sys').inherits,
    chr = String.fromCharCode;

function Display(config) {
    self = this;

    // configuration
    if (!config) config = {};

    // config
    this.address = config.address || "172.23.42.120";
    this.port    = config.port    || 2342;

    // create the socket
    this.sock = dgram.createSocket("udp4");

    this.sock.on("message", function (msg, rinfo) {
        console.log("Display got: " + msg + " from " + rinfo.address);
    });
    this.sock.on("listening", function () {
        console.log("Display listening on " + self.sock.address().address);
    });

    events.EventEmitter.call(this);
};
inherits(Display, events.EventEmitter);

// send a raw string
Display.prototype.send = function(string) {
    buf = Buffer(string);
    this.sock.send(buf, 0, buf.length, this.port, this.address, function(err) {
        if (err) throw err;
        console.log("Display sent: " + string);
    });
};

// send a request to the display
Display.prototype.request = function(req) {
    if (req.cmd === undefined) throw 'cmd is undefined';
    if (req.data === undefined) req.data = '';
    if (req.resend === undefined) req.resend = true;
    if (req.x === undefined) req.x = 0;
    if (req.y === undefined) req.y = 0;
    if (req.w === undefined) req.w = req.data.length;
    if (req.h === undefined) req.h = 1;

    async.map([req.cmd, req.x, req.y, req.w, req.h], encode, function(err, res) {
        if (err) throw err;
        bytes = res.cmd + res.x + res.y + res.w + res.h + req.data;
        this.send(bytes);
    });
}

// set exports
exports.Display = Display;
