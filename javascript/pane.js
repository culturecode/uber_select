function Pane(){
  var eventsTriggered = {
    shown: 'shown.UberSelect',
    hidden: 'hidden.UberSelect'
  }

  var context   = this
  var model     = {}
  var isOpen    = false
  var view      = $('<div class="pane"></div>').toggle(isOpen)
  var innerPane = $('<div class="pane_inner"></div>').appendTo(view)


  // PUBLIC INTERFACE

  $.extend(this, {
    model:         model,
    view:          view,
    addContent:    addContent,
    removeContent: removeContent,
    show:          show,
    hide:          hide,
    toggle:        toggle,
    isOpen:        paneIsOpen,
    isClosed:      paneIsClosed
  })


  // BEHAVIOUR

  // Make it possible to have elements in the pane that close it
  view.on('click', '[data-behaviour~=close-pane]', function(event){
    context.hide()
  })

  // Close the pane when the user presses escape
  $(document).on('keyup', function(event){
    if (event.which == 27 && isOpen){
      context.hide()
      return false
    }
  })


  // HELPER FUNCTIONS

  function paneIsOpen(){
    return isOpen
  }

  function paneIsClosed(){
    return !isOpen
  }

  function addContent(name, content){
    model[name] = content
    innerPane.append(content)
  }

  function removeContent(name){
    $(model[name]).remove()
    delete model['name']
  }

  function show(){
    if (isOpen) { return }
    isOpen = true
    view.show()
    triggerEvent(eventsTriggered.shown)
  }
  function hide(){
    if (!isOpen) { return }
    isOpen = false
    view.hide()
    triggerEvent(eventsTriggered.hidden)
  }
  function toggle(){
    if (isOpen) {
      context.hide()
    } else {
      context.show()
    }
  }

  function triggerEvent(eventType, callbackArgs){
    view.trigger(eventType, callbackArgs)
    $(context).trigger(eventType, callbackArgs)
  }
}
