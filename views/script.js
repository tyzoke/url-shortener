$(document).scroll(function() {
    navbarScroll();
  });
  
function navbarScroll() {
    var y = window.scrollY;
    if (y > 10) {
        $('.header').addClass('small');
    } else if (y < 10) {
        $('.header').removeClass('small');
    }
}

$('.wrapper').click(function(){
    $('.search').addClass('opened');
    $('.searchbox').focus();
  });
  
  $(document).keyup(function(e) {
       if (e.keyCode == 27) { 
          $('.search').removeClass('spin');
    $('.exit').removeClass('dark'); $('.search').removeClass('opened');
         $('.wrapper').removeClass('shrink');
         $('.searchbox').val('');
      }
  });
  
  $('.inner h4').click(function() {
  
          $('.search').removeClass('spin');
    $('.exit').removeClass('dark'); $('.search').removeClass('opened');   $('.wrapper').removeClass('shrink');
  $('.searchbox').val('');
  });
  
  $('.exit').click(function(){
    $('.search').removeClass('opened');
  });
  
  $('.searchform').submit(function(){
    $('.search').removeClass('opened')
  
    $('.wrapper').addClass('shrink');
    $('.search').addClass('spin');
    $('.exit').addClass('dark');
    return false;
  });
  
  $('.searchbox').keyup(function(e){
    const query = $('.searchbox').val();
    $.ajax({
      dataType: 'json',
      url: 'http://en.wikipedia.org/w/api.php?callback=?',
      data: {srsearch: query, action: 'query', list: 'search', format: 'json'},
      success: (data) => {
        $('.exit div p').empty();
        $.each(data.query.search, (i, item) => {
          $('.exit div p').append(`<div><a href='http://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}'>${item.title}</a>${item.snippet}</div>`);
        });
      }
    });
  });


