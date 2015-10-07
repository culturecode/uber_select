
(function( $ ) {
  $.fn.uberSelect = function(options) {
    this.each(function(){
      options          = $.extend({}, options)
      var select       = this
      var data         = dataFromSelect(this)
      var uberElement  = $('<span class="uber_select">')
      var uberText     = $('<span class="selected_text">').appendTo(uberElement)
      var searchInput  = $('<input type="text" class="search_input" placeholder="Type to search">')
      var searchOutput = $('<div class="results_container">')

      var search = new Search(searchInput, searchOutput, {
        model: {
          data: data,
          dataForMatching: dataForMatching,
          datumPreprocessor: datumPreprocessor
        },
        view: {
          renderResults: renderResultsWithGroupSupport
        }
      })
      var pane = new Pane({anchor: uberElement, trigger: uberElement})

      pane.addContent('search', searchInput)
      pane.addContent('results', searchOutput)

      uberElement.insertBefore(select).append(select)

      // Update the select element when a value is chosen
      searchOutput.on('click', '.result', function(){
        updateSelectValue(select, valueFromResult(this))
        pane.hide()
        search.clear()
        updateUberElement()
      })

      // Highlight the selected option in the list of results
      $(search).on('renderedResults', function(){
        markSelected(getSelectedResult())
      })

      $(pane).on('shown', function(){
        $(searchInput).focus() // Focus the searchInput when the pane is opened
        uberElement.addClass('open')
      })

      $(pane).on('hidden', function(){
        uberElement.removeClass('open')
      })


      // INITIALIZATION

      $(select).hide()
      markSelected(getSelectedResult())
      pane.hide()
      search.clear()
      updateUberElement()

      // HELPER FUNCTIONS

      // Given a select element
      // Returns an array of data to match against
      function dataFromSelect(select){
        return $(select).find('option').map(function(){
          var group = $(this).closest('optgroup').attr('label')
          var visibility = $(this).data('visibility')
          var value = $(this).data('match-value')

          if (value === undefined || value === null){
            value = $(this).val()
          }
          return {value:value, visibility:visibility, group:group}
        })
      }

      // Converts the dataFromSelect into a datum list for matching
      function dataForMatching(processedQuery, data){
        // If a query is present, include only select options that should be used when searching
        // Else, include only options that should be visible when not searching
        if (processedQuery) {
          return $.map(data, function(datum){ if (datum.visibility != 'no-query') return datum })
        } else {
          return $.map(data, function(datum){ if (datum.visibility != 'query') return datum })
        }
      }

      // Just match the datum value
      function datumPreprocessor(datum){
        return datum.value
      }

      function renderResultsWithGroupSupport(data){
        var list = $('<ul class="results">')
        var dummyNode = $('<div>')
        context = this
        $.each(data, function(_, datum){
          dummyNode.append(context.buildResult(datum.value).attr('data-group', datum.group))
        })

        // Arrange ungrouped list items
        dummyNode.find('li:not([data-group])').appendTo(list)

        // Arrange list items into sub lists
        while (dummyNode.find('li').length) {
          var group = dummyNode.find('li[data-group]').attr('data-group')
          var sublist = $('<ul class="sublist">').attr('data-group', group)
          dummyNode.find('li[data-group="' + group + '"]').appendTo(sublist)
          $('<li>')
            .append('<span class="sublist_name">' + group + '</span>')
            .append(sublist).appendTo(list)
        }

        $(this.resultsContainer).html(list)
      }

      // Returns the selected result based on the select's value
      function getSelectedResult(){
        return selectedResultFromValue($(select).val(), search.getResults())
      }

      // Updates the enhanced select with the text of the selected result
      function updateUberElement(){
        uberText.text($(select).find('option:selected').text())
      }

      function markSelected(selectedResult){
        var results = search.getResults()
        $(results).filter('.selected').removeClass('selected')
        $(selectedResult).addClass('selected')
      }

      function updateSelectValue(select, value){
        $(select).val(value)
      }

      // Returns the result with the given option value
      function selectedResultFromValue(value, results){
        var selected;
        $.each(results, function(_, result){
          if (value == valueFromResult(result)){
            selected = result
            return false
          }
        })
        return selected
      }

      function valueFromResult(result){
        return $(result).text()
      }
    })

    return this
  }
}( jQuery ));
