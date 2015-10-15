function SearchField(options){
  options = $.extend({
    clearButton:'&#x2715;' // Text content of clear search button
  }, options)

  var context     = this
  var input       = this.input       = $('<input type="text" class="search_input">').attr('placeholder', options.placeholder)
  var clearButton = this.clearButton = $('<span class="clear_search_button"></span>').html(options.clearButton)
  var view        = this.view        = $('<span class="search_field_container"></span>').append(input).append(clearButton)
  var eventNames  = EventHelpers.isOnInputSupported() ? 'input change' : 'keyup change'
  // BEHAVIOUR

  input.on(eventNames, updateClearButtonVisiblity)

  // When the clear button is pressed
  clearButton.on('click', function(){
    input.val('')
    updateClearButtonVisiblity()
    input.focus()
    triggerEvent('clear')
    triggerEvent('change')
  })

  // When the enter button is pressed
  input.on('keydown', function(event){
    if (event.which == 13){
      triggerEvent('querySubmit')
    }
  })


  // INITIALIZATION
  updateClearButtonVisiblity()

  // PUBLIC INTERFACE

  this.refresh = function(){
    updateClearButtonVisiblity()
  }

  // HELPER FUNCTIONS

  function updateClearButtonVisiblity(){
    clearButton.toggle(!!input.val().length)
  }

  // Allow observer to be attached to the SearchField itself
  function triggerEvent(eventType, callbackArgs){
    input.trigger(eventType, callbackArgs)
    $(context).trigger(eventType, callbackArgs)
  }
}
