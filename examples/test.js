var display = require('cccb-display');

var disp = new display.Display();

// clear the display
disp.clear();

function test() {
  var x = 0;
  for(var y=0; y<20; y++) {
    for (var x=0; x<56; x+=3) {
      disp.request({cmd:3, y:y, x:x, data:'BLA'});
    }
  }
  setTimeout(test, 5000);
}
function count(i) {
  disp.request({cmd:3, y:0, x:0, data:i.toString(), resend:false}, function() {
    count(++i);
  });
}
count(0);
