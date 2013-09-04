var getCookie = function( key ) {
  var cookieArray = document.cookie.split(';');
  
  for(var i = 0; i < cookieArray.length; i++){
    if( cookieArray[i].indexOf(key) !== -1){
      var str = cookieArray[i].split('=');
      return str[1];
    }
  }
};

var cookie = getCookie('test');
