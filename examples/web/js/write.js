(function($){

  function send(text) {
    display.clear();
    lines = text.split('\n');
    for (l in lines) {
      display.request({cmd: 3, data: lines[l], y: l});
    }
  }

  var textarea = $('textarea');

  $(window).bind('keyup', function() {
    send(textarea.val());
  });
})(jQuery);
