var display = require('cccb-display');
display.DEBUG = true;

var disp = new display.Display();

disp.request({cmd: 2});
for(var y=0; y<20; y++) {
  for (var x=0; x<56; x+=3) {
    console.log(x)
    console.log(y)
    disp.request({cmd:3, y:y, x:x, data:'BLA'});
  }
}
