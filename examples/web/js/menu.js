(function($){
  function chpage(){
    var template = $('script' + location.hash).html();
    if (!template)
      template = $('script#default').html();
    $('#content').html(tmpl(template));
  }
  $(window).bind('hashchange', chpage);
  $(window).ready(chpage);
})(jQuery);
