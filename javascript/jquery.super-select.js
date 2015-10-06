function Search(queryInput, resultsContainer, options){
  var model = this.model = new SearchModel(options.model)
  var view = this.view = new SearchView(resultsContainer, options.view)


  // HELPER FUNCTIONS
  this.renderResults = function(){
    view.renderResults(model.getResults())
  }


  // BEHAVIOUR

  $(queryInput).on('input', function(){
    model.setQuery(this.value)
  })

  $(model).on('resultsUpdated', this.renderResults)


  // INITIALIZATION

  this.renderResults()
}

function SearchModel(options){
  options = $.extend({ data:[] }, options)

  var data, query, results;
  var context = this

  this.setQuery = function(value){
    query = value
    this.updateResults()
  }

  this.setData = function(value){
    data = value
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

  this.setData(options.data)
}

function SearchView(resultsContainer, options){
  var context = this

  this.renderResults = function(data){
    var list = $('<ul class="results">')
    $.each(data, function(_, datum){
      list.append(context.buildResult(datum))
    })
    $(resultsContainer).html(list)
  }

  // Can be overridden to format how results are built
  this.buildResult = function(datum){
    return $('<li class="result">').text(datum)
  }
}




// Pane to hold content
function PaneView(options){
  options = $.extend({
    trigger: null // An element that when clicked, shows the pane. Can be a jquery collection or css selector
  }, options );

  var pane = $('<div class="super-select-pane">')


  // BEHAVIOUR

  if (options.trigger){
    // Show the pane when the select element is clicked
    $('body').on('click', options.trigger, showPane)

    // Hide the pane when clicked out
    $(document).on('click', function(event){
      if ($(event.target).closest(options.trigger).length == 0) { hidePane() }
    })
  }

  // INITIALIZATION

  return { element:pane }

  // HELPER FUNCTIONS

  function showPane(){
    pane.show()
  }
  function hidePane(){
    pane.hide()
  }
};
