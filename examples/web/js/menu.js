(function($){
  function chpage(){
    var html, name;

    if (location.hash[0] === '#') {
      name = location.hash.substr(1);
      html = $('script#' + name).html();
    }
    if (!html)
      html = $('script#default').html();

    // apply
    $('#content').html(html);

    if (name)
      $('body').append('<script src="/js/'+ name +'.js"></script>');
  }
  $(window).bind('hashchange', chpage);
  $(window).ready(chpage);
})(jQuery);
