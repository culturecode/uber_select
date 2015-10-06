function Search(queryInput, resultsContainer, options){
  var context = this
  var model = this.model = new SearchModel(options.model)
  var view = this.view = new SearchView(resultsContainer, options.view)


  // HELPER FUNCTIONS
  this.renderResults = function(){
    view.renderResults(model.getResults())
    $(this).trigger('renderedResults')
  }

  this.getResults = function(){
    return view.getResults()
  }

  this.clear = function(){
    model.setQuery('')
    queryInput.val('')
  }

  // BEHAVIOUR

  $(queryInput).on('input', function(){
    model.setQuery(this.value)
  })

  $(model).on('resultsUpdated', function(){
    context.renderResults()
  })


  // INITIALIZATION

  this.renderResults()


  // PROTOTYPES

  function SearchModel(options){
    var data, query, results;
    var context = this

    this.setQuery = function(value){
      query = value
      this.updateResults()
    }

    this.setData = function(value){
      data = value || []
      this.updateResults()
    }

    this.getResults = function(){
      return results
    }

    this.updateResults = function(){
      if (this.isBlankQuery(this.queryPreprocessor(query))){
        results = $(data).map(function(){ return this })
      } else {
        results = []
        $(this.dataForMatching(query, data)).each(function(index, datum){
          if (context.match(context.queryPreprocessor(query), context.datumPreprocessor(datum), index)){
            results.push(datum)
          }
        })
      }
      $(this).trigger('resultsUpdated')
    }

    this.isBlankQuery = function(processedQuery){
      return $.trim(processedQuery) === ''
    }

    // Can be overridden to select a subset of data for matching
    // Defaults to the identity function
    this.dataForMatching = function(query, data){
      return data
    }

    // Can be overridden to provide more sophisticated matching behaviour
    this.match = function(processedQuery, processedDatum, index){
      return processedDatum.indexOf(processedQuery) > -1
    }

    // Can be overridden to mutate the query being used to match before matching
    // Defaults to the identity function
    this.queryPreprocessor = function(query){
      return query
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
    var resultClass = 'result'

    this.getResults = function(){
      return $(resultsContainer).find('.' + resultClass)
    }

    this.renderResults = function(data){
      var list = $('<ul class="results">')
      $.each(data, function(_, datum){
        list.append(context.buildResult(datum))
      })
      $(resultsContainer).html(list)
    }

    // Can be overridden to format how results are built
    this.buildResult = function(datum){
      return $('<li>').text(datum).addClass(resultClass)
    }

    // INITIALIZATION
    $.extend(this, options) // Allow overriding of functions
  }
}
