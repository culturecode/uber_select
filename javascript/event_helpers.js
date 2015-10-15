EventHelpers = {
  isOnInputSupported: function(){
    // IE 8 and 9 are the only common browsers that don't completely support oninput
    return document.all && !window.atob // Source: http://tanalin.com/en/articles/ie-version-js/;
  }
}
