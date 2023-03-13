var OutputContainer = function(options){
  options = $.extend({}, options)
  var view         = $('<span class="selected_text_container" aria-expanded="false" aria-haspopup="listbox" role="combobox" tabindex="0"></span>')
  var selectedText = $('<span class="selected_text"></span>').appendTo(view)
  var selectCaret  = $('<span class="select_caret"></span>').appendTo(view).html(options.selectCaret)

  // INITIALIZATION

  setValue()

  // HELPER FUNCTIONS
  function open() {
    view.attr('aria-expanded', true)
  }

  function close() {
    view.attr('aria-expanded', false)
  }

  function setValue(value){
    selectedText.text(value || String.fromCharCode(160)); // Insert value or &nbsp;

    view.toggleClass('empty', !value)
  }

  function setDisabled(boolean) {
    view.toggleClass('disabled', boolean)
  }

  // PUBLIC INTERFACE

  $.extend(this, {view: view, setValue: setValue, setDisabled: setDisabled, open: open, close: close})
}
