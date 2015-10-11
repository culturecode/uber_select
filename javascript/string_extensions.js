(function(){
  // Add a function that makes it easy to escape a string before it is used in a RegExp
  if (!String.prototype.escapeForRegExp){
    String.prototype.escapeForRegExp = function(){
      return this.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
})()
