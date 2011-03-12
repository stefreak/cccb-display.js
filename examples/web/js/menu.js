(function($){
  function chpage(){
    var html, name;

    // get name
    if (location.hash[0] === '#') {
      name = location.hash.substr(1);
    }

    // validate name
    switch(name) {
      case 'write':
      case 'draw':
        break;
      default:
        name = 'default';
    }

    // get template
    html = $('script#' + name).html();

    // apply
    $('#content').html(html);

    // append script
    if (name !== 'default')
      $('body').append('<script src="/js/'+ name +'.js"></script>');
  }

  // register events
  $(window).bind('hashchange', chpage);
  $(window).ready(chpage);
})(jQuery);
