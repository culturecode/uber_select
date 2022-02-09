function List(options) {
  var context = this

  var view = this.view = $('<ul class="results"></ul>')


  // BEHAVIOUR

  // Handle up and down arrow key presses
  $(options.keypressInput || view).on('keydown', function(event){
    console.log("keydown", event.which)
    switch (event.which) {
      case 38: // Up Arrow
        stepHighlight(-1, true)
        return false
      case 40: // Down Arrow
        stepHighlight(1)
        return false
      case 13: // Enter
        if (highlightedResult().length) {
          highlightedResult().click()
        } else {
          $(this).trigger('noHighlightSubmit')
        }
        return false
    }
  })

  // When a list item is hovered
  $(view).on('mouseenter', '.result:not(.disabled)', function(){
    unhighlightResults()
    highlightResult(this, {scroll: false})
  })


  // HELPER FUNCTIONS

  this.getResults = function(){
    return $(view).find('.result')
  }

  this.renderResults = function(data){
    console.log("List.prototype.renderResults", data)
    var results = $.map(data, function(datum){
      return context.buildResult(datum)
    })

    console.log("renderResults results", results)

    view.toggleClass('empty', !data.length)

    view.html(results)
  }

  // Can be overridden to format how results are built
  this.buildResult = function(datum){
    var $link = $('<a href="#"></a>').html(datum)
    return $('<li role="option" class="result" tabindex="0"></li>').html($link)
  }

  this.unhighlightResults = unhighlightResults
  this.highlightResult = highlightResult

  function stepHighlight(amount, allowUnhighlight){
    var index = selectableResults().index(highlightedResult())
    var result = selectableResults()[index + amount]

    if (result || allowUnhighlight){
      unhighlightResults()
      highlightResult(result)
    }
  }

  function highlightResult(result, options) {
    result = $(result)
    options = $.extend({scroll: true}, options)

    if (!result.length) { return }

    result.addClass('highlighted')
    result.attr("aria-selected", true)

    if (options.scroll){
      scrollResultIntoView(result)
    }
  }

  function unhighlightResults(){
    highlightedResult().removeClass('highlighted').attr("aria-selected", false)
  }

  function highlightedResult(){
    return results().filter('.highlighted')
  }

  function selectableResults(){
    return visibleResults().not('.disabled')
  }

  function visibleResults(){
    return results().not('.hidden')
  }

  function results(){
    return view.find('.result')
  }

  function scrollResultIntoView(result){
    result = $(result)
    var container = result.closest('.results').css('position', 'relative') // Ensure the results container is positioned so offset is calculated correctly
    var containerHeight = container.outerHeight()
    var containerTop = container.get(0).scrollTop
    var containerBottom = containerTop + containerHeight
    var resultHeight = result.outerHeight()
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
