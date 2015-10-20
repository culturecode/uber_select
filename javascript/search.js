function Search(queryInput, resultsContainer, options){
  var context = this
  var model = new SearchModel(options.model)
  var list = new List(options.view)

  // HELPER FUNCTIONS

  this.renderResults = function(){
    list.renderResults(model.getResults())
    $(this).trigger('renderedResults')
  }

  this.getQuery = function(){
    return model.getQuery()
  }

  this.getResults = function(){
    return list.getResults()
  }

  this.clear = function(){
    if (queryInput.val() === '') {
      list.unhighlightResults()
    } else {
      queryInput.val('').change()
    }
  }

  this.highlightResult = function(index) {
    list.unhighlightResults()
    list.stepHighlight(index + 1)
  }

  // BEHAVIOUR

  $(queryInput).on('searchInput', function(){
    model.setQuery(this.value)
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

  function SearchModel(options){
    var data, results
    var processedQuery = ''
    var context = this
    options = $.extend({minQueryLength: 0}, options)

    this.setQuery = function(value){
      value = context.queryPreprocessor(value)

      if (processedQuery == value) { return }
      processedQuery = value || ''
      this.updateResults()
      $(this).trigger('queryChanged')
    }

    this.getQuery = function(){
      return processedQuery || ''
    }

    this.setData = function(value){
      data = value || []
      this.updateResults()
    }

    this.getResults = function(){
      return results
    }

    this.updateResults = function(){
      if (options.minQueryLength > processedQuery.length) {
        results = []
      } else if (this.isBlankQuery()){
        results = $.each(this.dataForMatching(processedQuery, data), function(){ return this })
      } else {
        results = []
        var pattern = this.patternForMatching(processedQuery)
        $.each(this.dataForMatching(processedQuery, data), function(index, datum){
          if (context.match(pattern, context.datumPreprocessor(datum), processedQuery)){
            results.push(datum)
          }
        })
      }
      $(this).trigger('resultsUpdated')
    }

    this.isBlankQuery = function(){
      return processedQuery === ''
    }

    // Can be overridden to select a subset of data for matching
    // Defaults to the identity function
    this.dataForMatching = function(processedQuery, data){
      return data
    }

    // Provides a regexp for matching the processedDatum from the processedQuery
    // Can be overridden to provide more sophisticated matching behaviour
    this.patternForMatching = function(processedQuery){
      return new RegExp(processedQuery.escapeForRegExp(), 'i')
    }

    // Can be overridden to provide more sophisticated matching behaviour
    this.match = function(pattern, processedDatum, processedQuery){
      return pattern.test(processedDatum)
    }

    // Can be overridden to mutate the query being used to match before matching
    // Defaults to whitespace trim
    this.queryPreprocessor = function(query){
      return $.trim(query)
    }

    // Can be overridden to mutate the data the moment before it is matched
    // Useful extract string from JSON datum
    // Defaults to the identity function
    this.datumPreprocessor = function(datum){
      return datum
    }

    // INITIALIZATION
    $.extend(this, options) // Allow overriding of functions
    delete this.data // Data isn't an attribute we want to expose
    this.setData(options.data)
  }
}
