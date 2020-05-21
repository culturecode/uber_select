var OutputContainer = function(options){
  options = $.extend({}, options)
  var view         = $('<span class="selected_text_container" tabindex=0 role="button"></span>')
  var selectedText = $('<span class="selected_text"></span>').appendTo(view)
  var selectCaret  = $('<span class="select_caret"></span>').appendTo(view).html(options.selectCaret)

  // INITIALIZATION

  setValue()

  // HELPER FUNCTIONS

  function setValue(value){
    selectedText.html(value || '&nbsp;')
    view.toggleClass('empty', !value)
  }

  function setDisabled(boolean) {
    view.toggleClass('disabled', boolean)
  }

  // PUBLIC INTERFACE

  $.extend(this, {view: view, setValue: setValue, setDisabled: setDisabled})
}
