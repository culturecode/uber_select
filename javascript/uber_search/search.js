(function($) {
  UberSearch.Search = function(queryInput, resultsContainer, options){
    var context = this
    var model = new UberSearch.SearchModel(options.model)
    var list = new UberSearch.List(options.view)
    var resultsRendered = false

    // HELPER FUNCTIONS

    this.setData = function(data){
      model.setData(data)
    }

    this.renderResults = function(){
      list.renderResults(model.getResults())
      $(this).trigger('renderedResults')
      resultsRendered = true
    }

    this.getQuery = function(){
      return model.getQuery()
    }

    this.getResults = function(){
      return list.getResults()
    }

    this.clear = function(){
      if (!resultsRendered){
        this.renderResults()
      }

      if (queryInput.val() === '') {
        list.unhighlightResults()
      } else {
        queryInput.val('').change()
      }
    }

    this.highlightResult = function(element, options) {
      list.unhighlightResults()
      list.highlightResult(element, options)
    }

    this.stepHighlight = list.stepHighlight
    this.setHighlight = list.setHighlight


    // BEHAVIOUR

    $(queryInput).on('searchInput', function(){
      model.setQuery(this.value)
    })

    // Forward navigating away from queryInput
    $(queryInput).on('inputDownArrow', function() {
      $(context).trigger('inputDownArrow')
    })

    // Handle ENTER key in search input
    $(queryInput).on('querySubmit', function() {
      var highlightedResult = list.highlightedResult()
      
      if (highlightedResult.length) {
        highlightedResult.click()
      }
    })

    $(model).on('resultsUpdated', function(){
      context.renderResults()
    })

    // Forward query change
    $(model).on('queryChanged', function(){
      $(context).trigger('queryChanged')
    })


    // INITIALIZATION

    resultsContainer.html(list.view)


    // PROTOTYPES
  }
})(jQuery)
