function Pane(options){
  options = $.extend({
    anchor: null,
    trigger: null
  }, options)

  var context = this
  var model = this.model = {}
  var isOpen = false
  var view = this.view = $('<div class="pane"></div>').toggle(isOpen)
  var innerPane = $('<div class="pane_inner"></div>').appendTo(view)

  this.addContent = function(name, content){
    model[name] = content
    innerPane.append(content)
  }

  this.removeContent = function(name){
    $(model[name]).remove()
    delete model['name']
  }

  // BEHAVIOUR

  if (options.trigger){
    // Show the pane when the select element is clicked
    $(options.trigger).on('click', function(event){
      context.show()
    })

    // Show the pane if the user was tabbed onto the trigger and pressed enter or space
    $(options.trigger).on('keyup', function(event){
      if (event.which == 13 || event.which == 32){
        context.show()
        return false
      }
    })
  }

    // Hide the pane when clicked out
  $(document).on('click', function(event){
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
    }
  })


  // HELPER FUNCTIONS

  this.show = function(){
    if (isOpen) { return }
    isOpen = true
    view.show()
    $(context).trigger('shown')
  }
  this.hide = function(){
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

  // INITIALIZATION

  $(options.anchor).append(view)
}
