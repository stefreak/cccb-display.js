var display = require('cccb-display')
  , inherits = require('sys').inherits
  , events = require('events')
  ;

function PixelBuffer(disp) {
  var self = this;

  self.buffer    = new Buffer(display.lines*display.linelen*display.moduleWidth);
  self.bufferCmp = new Buffer(display.lines*display.linelen*display.moduleWidth);

  // clear the buffers
  for (var i=0; i < self.buffer.length; i++) {
    self.buffer[i] = 0;
    self.bufferCmp[i] = 0;
  }

  self.disp = disp;

  // state
  self.sending = false;
  self.changed = false;

  // get the first diff from the buffers
  function firstDiff(start, end) {
    var diff = []
      , diffStart = null
      , diffEnd = null
      , next = null
      ;

    // loop through the buffers
    for (var i = start; i < (end || self.buffer.length); i++) {
      if (i > self.buffer.length)
        break;

      // get the bytes
      b = self.buffer[i];
      cmp = self.bufferCmp[i];
      console.log(self.buffer);

      // compare them / get start and end
      if (diffStart === null) {
        if (b !== cmp)
          diffStart = i;
      } else if (diffEnd === null) {
        if (b === cmp) {
          if (next = firstDiff(i, end || i + 56*2))
            diffEnd = next[1];
          else
            diffEnd = i;
          break;
        }
      }
    }

    // couldn't find any diff
    if (!diffStart)
      return false;

    // return diff
    diff[0] = diffStart;
    diff[1] = diffEnd;
    return diff;
  }

  // find all diffs
  function findDiffs() {
    var differences = []
      , start = 0
      , diff
      ;

    // loop through all diffs
    while(diff = firstDiff(start)) {
      console.log(diff);
      start = diff[1] + 1;
      differences.push(diff);
    }

    return differences;
  }

  function sendDiffs() {
    self.changed = false;

    var differences = findDiffs();
    if (differences.length === 0) {
      self.sending = false;
      return;
    }

    self.sending = true;
    self.buffer.copy(self.bufferCmp);

    self.disp.clear();
    self.disp.request({cmd:3, y:i, data:JSON.stringify(differences) + '          '}, function(err) {
      self.sending = false;
      if (err) throw err;
      if (self.changed) {
        process.nextTick(sendDiffs());
      }
    });
  }

  self.on('bufferChanged', function() {
    console.log('handling bufferChanged');

    if (self.sending) {
      self.changed = true;
      return;
    }

    process.nextTick(sendDiffs);
  });

  events.EventEmitter.call(this);
}
inherits(PixelBuffer, events.EventEmitter);

PixelBuffer.prototype.sendBuffer = function() {
  return;
};

PixelBuffer.prototype.setPixel = function(x, y) {
  console.log('setPixel '+x+','+y);
  if (x < (display.moduleWidth * display.linelen) &&
      y < (display.moduleHeight * display.lines) &&
      (y % display.moduleHeight) <= 7) {
    var index = (y / display.moduleHeight) * display.linelen * display.moduleWidth + x;
    console.log(index);
    this.buffer[index] |= (1 << (7-(y % display.moduleHeight)));
    console.log(this.buffer[index]);

    console.log('firing bufferChanged');
    this.emit('bufferChanged');
  }
}

PixelBuffer.prototype.drawLine = function(from, to) {
  this.setPixel(from.x, from.y);
  this.setPixel(to.x, to.y);
}

// set the exports
exports.PixelBuffer = PixelBuffer
