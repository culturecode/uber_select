function List(options) {
  var context = this

  var view = this.view = $('<ul class="results"></ul>')


  // BEHAVIOUR

  // Handle up and down arrow key presses
  $(options.keypressInput).on('keydown', function(event){
    switch (event.which) {
      case 38: // Up Arrow
        stepHighlight(-1, true)
        break
      case 40: // Down Arrow
        stepHighlight(1)
        break
      case 13: // Enter
        highlightedResult().click()
        break
    }
  })


  // HELPER FUNCTIONS

  this.getResults = function(){
    return $(view).find('.result')
  }

  this.renderResults = function(data){
    var results = $.map(data, function(datum){
      return context.buildResult(datum)
    })

    view.toggleClass('empty', !data.length)

    view.html(results)
  }

  // Can be overridden to format how results are built
  this.buildResult = function(datum){
    return $('<li></li>').html(datum).addClass('result')
  }

  this.stepHighlight = stepHighlight

  this.unhighlightResults = unhighlightResults

  function stepHighlight(amount, allowUnhighlight){
    var index = visibleResults().index(highlightedResult())
    var result = visibleResults()[index + amount]

    if (result || allowUnhighlight){
      unhighlightResults()
      highlightResult(result)
    }
  }

  function highlightResult(result){
    result = $(result)
    if (!result.length) { return }

    result.addClass('highlighted')
    scrollResultIntoView(result)
  }

  function unhighlightResults(){
    highlightedResult().removeClass('highlighted')
  }

  function highlightedResult(){
    return results().filter('.highlighted')
  }

  function visibleResults(){
    return results().filter(':visible')
  }

  function results(){
    return view.find('.result')
  }

  function scrollResultIntoView(result){
    result = $(result)
    var container = result.closest('.results').css('position', 'relative') // Ensure the results container is positioned so offset is calculated correctly
    var containerHeight = container.height()
    var containerTop = container.get(0).scrollTop
    var containerBottom = containerTop + containerHeight
    var resultHeight = result.height()
    var resultTop = result.get(0).offsetTop
    var resultBottom = resultTop + resultHeight

    if (containerBottom < resultBottom){
      container.scrollTop(resultBottom - containerHeight)
    } else if (containerTop > resultTop){
      container.scrollTop(resultTop)
    }
  }

  // INITIALIZATION
  $.extend(this, options) // Allow overriding of functions
}
