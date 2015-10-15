function Search(queryInput, resultsContainer, options){
  var context = this
  var model = this.model = new SearchModel(options.model)
  var view = this.view = new SearchView(resultsContainer, options.view)
  var eventNames  = EventHelpers.isOnInputSupported() ? 'input change' : 'keyup change'

  // HELPER FUNCTIONS

  this.renderResults = function(){
    view.renderResults(model.getResults())
    $(this).trigger('renderedResults')
  }

  this.getResults = function(){
    return view.getResults()
  }

  this.clear = function(){
    if (queryInput.val() !== ''){
      queryInput.val('').change()
    }
  }

  // BEHAVIOUR

  $(queryInput).on(eventNames, function(){
    model.setQuery(this.value)
  })

  // If there's only one option and the user presses enter, click that option
  $(queryInput).on('keydown', function(event){
    if (event.which == 13){
      var results = context.getResults()
      if (results.length == 1){
        results.first().click()
      }
      return false
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

  this.renderResults()


  // PROTOTYPES

  function SearchModel(options){
    var data, query, results;
    var context = this
    options = $.extend({minQueryLength: 0}, options)

    this.setQuery = function(value){
      if (query == value) { return }
      query = value
      this.updateResults()
      $(this).trigger('queryChanged')
    }

    this.getQuery = function(){
      return query || ''
    }

    this.setData = function(value){
      data = value || []
      this.updateResults()
    }

    this.getResults = function(){
      return results
    }

    this.updateResults = function(){
      var processedQuery = context.queryPreprocessor(query)
      if (options.minQueryLength > processedQuery.length) {
        results = []
      } else if (this.isBlankQuery(processedQuery)){
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

    this.isBlankQuery = function(processedQuery){
      return processedQuery === ''
    }

    // Can be overridden to select a subset of data for matching
    // Defaults to the identity function
    this.dataForMatching = function(query, data){
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

  function SearchView(resultsContainer, options){
    var context = this

    this.resultsContainer = resultsContainer
    this.options = options = $.extend({
      resultClass: 'result'
    }, options)

    this.getResults = function(){
      return $(resultsContainer).find('.' + options.resultClass)
    }

    this.renderResults = function(data){
      var list = $('<ul class="results"></ul>')
      $.each(data, function(_, datum){
        list.append(context.buildResult(datum))
      })

      if (data.length == 0) {
        list.addClass('empty')
      }

      $(resultsContainer).html(list)
    }

    // Can be overridden to format how results are built
    this.buildResult = function(datum){
      return $('<li></li>').html(datum).addClass(options.resultClass)
    }

    // INITIALIZATION
    $.extend(this, options) // Allow overriding of functions
  }
}
