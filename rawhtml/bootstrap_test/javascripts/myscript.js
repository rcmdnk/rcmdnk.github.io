$(function() {
  $('.navbar-collapse .dropdown li a').click(function() {
    $('.navbar-collapse').collapse('hide');
  });
  function switchTab(c){
    if(c.indexOf('sabi') == 0){
      $('body').removeClass('sango');
      $('body').addClass('sabi');
      $('.main-tab a[href="#sabi-tab"]').tab('show');
    }else{
      $('body').removeClass('sabi');
      $('body').addClass('sango');
      $('.main-tab a[href="#sango-tab"]').tab('show');
    }
  }
  function switchContent(c){
    $('.sidebar div').not('#' + c + '-sidebar').removeClass('active');
    $('#' + c + '-sidebar').addClass('active');
  }
  function switchContentTab(c){
    switchContent(c);
    $('.c-menu a[href=#' + c +']').tab('show');
  }
  if($.cookie('active-c')){
    var c = $.cookie('active-c');
    $('.c-menu a[data-toggle="tab"]').parent().removeClass('active');
    switchTab(c);
    switchContentTab(c);
  }else{
    $('body').addClass('sabi');
    $('.detector-tab a[href="#sabi-tab"]').tab('show');
  }
  $('.sidebar div.sidebar-panel').click( function () {
    var c = this.id.replace('-sidebar','');
    switchContentTab(c);
  });
  $('.c-menu a[data-toggle="tab"]').on('show.bs.tab', function (e) {
    var c = e.target.href.split("#")[1];
    $('.c-menu a[data-toggle="tab"]').not('a[href=#'+c+']').parent().removeClass('active');
    switchTab(c);
    switchContent(c);
    $.cookie('active-c', c, { expires: 600 });
  });
});
