function SearchField(options){
  options = $.extend({
    placeholder: 'Type to Search',
    searchInputAttributes: { 'aria-label': "Type to Search" },
    clearButton:'&#x2715;' // Text content of clear search button
  }, options)

  var inputAttrs = {}
  $.extend(inputAttrs, { placeholder: options.placeholder }, options.searchInputAttributes)

  var context     = this
  var input       = this.input       = $('<input type="search" class="search_input">').attr(inputAttrs)
  var value       = input.val()
  var clearButton = this.clearButton = $('<span class="clear_search_button"></span>').html(options.clearButton)
  var view        = this.view        = $('<span class="search_field_container"></span>').append(input).append(clearButton)
  var eventNames  = isOnInputSupported() ? 'input change' : 'keyup change'


  // PUBLIC INTERFACE

  $.extend(this, {refresh: refresh})


  // BEHAVIOUR

  // When a change is detected
  input.on(eventNames, function() {
    refresh() // Always refresh on input in case something has altered the state without informing us

    if (input.val() == value) { return }

    triggerEvent('searchInput')
    value = input.val()
  })

  // When the clear button is pressed
  clearButton.on('click', function(){
    input.val('')
    refresh()
    input.focus()
    triggerEvent('searchInput')
    triggerEvent('clear')
  })

  // When the enter button is pressed
  input.on('keydown', function(event){
    if (event.which == 13){
      triggerEvent('querySubmit')
    }

    if (event.which == 38) { // Up Arrow
      triggerEvent('inputUpArrow')
      return false
    }

    if (event.which == 40){ // Down Arrow
      triggerEvent('inputDownArrow')
      return false
    }
  })


  // HELPER FUNCTIONS

  function refresh(){
    updateClearButtonVisiblity()
    updateSearchInputClass()
  }

  function updateSearchInputClass(){
    input.toggleClass('empty', !input.val())
  }

  function isOnInputSupported(){
    // IE 8 and 9 are the only common browsers that don't completely support oninput
    // IE 10 and 11 fire the input event when the element is focussed, treat them as unsupported as well
    return !(navigator.userAgent.indexOf('MSIE')!==-1 || navigator.appVersion.indexOf('Trident/') > 0) // SOURCE: http://stackoverflow.com/questions/21825157/internet-explorer-11-detection
  }

  function updateClearButtonVisiblity(){
    clearButton.toggle(!!input.val().length)
  }

  // Allow observer to be attached to the SearchField itself
  function triggerEvent(eventType, callbackArgs){
    input.trigger(eventType, callbackArgs)
    $(context).triggerHandler(eventType, callbackArgs)
  }


  // INITIALIZATION

  refresh()
}
