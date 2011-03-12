(function($){
  function chpage(){
    var template, name;

    if (location.hash[0] === '#') {
      name = location.hash.substr(1);
      template = $('script#' + name).html();
    }
    if (!template)
      template = $('script#default').html();

    // apply
    $('#content').html(tmpl(template));

    if (name)
      $('body').append('<script src="/js/'+ name +'.js"></script>');
  }
  $(window).bind('hashchange', chpage);
  $(window).ready(chpage);
})(jQuery);
