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
    $(options.trigger).on('click', function(){
      if ($(event.target).closest(view).length ) { return }
      context.show()
    })

    // Hide the pane when clicked out
    $(document).on('click', function(event){
      if ($(event.target).closest(options.trigger).length || $(event.target).closest(view).length ) { return }
      context.hide()
    })

    // Make it possible to have elements in the pane that close it
    view.on('click', '[data-behaviour~=close-pane]', function(event){
      context.hide()
    })
  }

  // Close the pane when the user presses escape
  $(document).on('keyup', function(event){
    if (event.which == 27)
      context.hide()
  })


  // HELPER FUNCTIONS

  this.show = function(){
    if (isOpen) { return }
    isOpen = true
    view.show()
    $(this).trigger('shown')
  }
  this.hide = function(){
    if (!isOpen) { return }
    isOpen = false
    view.hide()
    $(this).trigger('hidden')
  }

  // INITIALIZATION

  $(options.anchor).append(view)
}
