(function($){
  var old = [""];

  function send(text) {
    var lines = text.split('\n');

    for (l in lines) {
      empty = "                                                              ";
      line = lines[l];
      if (old[l] !== line) {
        if (line.length < 56)
          line += empty.substr(0, 56 - line.length);
        else
          line = line.substr(0, 56);
        display.request({cmd: 3, data: line, y: l});
      }
    }

    old = lines;
  }

  var textarea = $('textarea');

  display.clear();
  $(window).bind('keyup', function() {
    send(textarea.val());
  });
})(jQuery);
