

function Pane(options){
  options = $.extend({
    anchor: null,
    trigger: null
  }, options)

  var context = this
  var model = this.model = {}
  var view = this.view = $('<div class="super-select-pane">')

  this.addContent = function(name, content){
    model[name] = content
    view.append(content)
  }

  this.removeContent = function(name){
    $(model[name]).remove()
    delete model['name']
  }

  // BEHAVIOUR

  if (options.trigger){
    // Show the pane when the select element is clicked
    $(options.trigger).on('click', function(){
      context.show()
    })

    // Hide the pane when clicked out
    $(document).on('click', function(event){
      if ($(event.target).closest(options.trigger).length || $(event.target).closest(view).length ) { return }
      context.hide()
    })
  }

  // HELPER FUNCTIONS

  this.show = function(){
    view.show()
  }
  this.hide = function(){
    view.hide()
  }

  // INITIALIZATION

  $(options.anchor).append(view)
}
