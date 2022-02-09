function Pane(options){
  options = $.extend({
    trigger: null
  }, options)

  var context = this
  var model = this.model = {}
  var isOpen = false
  var view = this.view = $('<div class="pane"></div>').toggle(isOpen)
  var innerPane = $('<div class="pane_inner"></div>').appendTo(view)


  // PUBLIC INTERFACE

  $.extend(this, {view: view, addContent: addContent, removeContent: removeContent, show: show, hide: hide})


  // BEHAVIOUR

  if (options.trigger){
    // Show the pane when the select element is clicked
    $(options.trigger).on('click', function(event){
      if ($(options.trigger).hasClass('disabled')) { return }

      context.show()
    })

    // Show the pane if the user was tabbed onto the trigger and pressed enter, space, or down arrow
    $(options.trigger).on('keyup', function(event){
      if ($(options.trigger).hasClass('disabled')) { return }

      if (event.which === 32 || event.which === 40){
        context.show()
        return false
      } else if (event.which === 13) { // toggle pane when enter is pressed
        if (isOpen) context.hide()
        else        context.show()
        return false
      }
    })
  }

    // Hide the pane when clicked out
  $(document).on('mousedown', function(event){
    if (isEventOutsidePane(event) && isEventOutsideTrigger(event)){
      context.hide()
    }
  })

  // Make it possible to have elements in the pane that close it
  view.on('click', '[data-behaviour~=close-pane]', function(event){
    context.hide()
  })

  // Close the pane when the user presses escape
  $(document).on('keyup', function(event){
    if (event.which == 27 && isOpen){
      context.hide()
      options.trigger.focus()
      return false
    }
  })


  // HELPER FUNCTIONS

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
    $(context).trigger('shown')
  }
  function hide(){
    if (!isOpen) { return }
    isOpen = false
    view.hide()
    $(context).trigger('hidden')
  }

  // returns true if the event originated outside the pane
  function isEventOutsidePane(event){
    return !$(event.target).closest(view).length
  }

  function isEventOutsideTrigger(event){
    return !$(event.target).closest(options.trigger).length
  }

}
