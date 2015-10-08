
(function( $ ) {
  $.fn.uberSelect = function(opts) {
    this.each(function(){
      var options           = $.extend({search:true, clearSearchButton:'&#x2715;', selectCaret: '&#x2304;'}, opts, $(this).data('uber-options'))
      var select            = this
      var placeholder       = $(select).attr('placeholder') || $(select).attr('data-placeholder')
      var data              = dataFromSelect(this)
      var uberElement       = $('<span class="uber_select">')
      var uberText          = $('<span class="selected_text">').appendTo(uberElement)
      var selectCaret       = $('<span class="select_caret">').appendTo(uberElement).html(options.selectCaret)
      var searchInput       = $('<input type="text" class="search_input" placeholder="Type to search">')
      var searchOutput      = $('<div class="results_container">')
      var clearSearchButton = $('<span class="clear_search_button">').html(options.clearSearchButton)

      var pane   = new Pane({anchor: uberElement, trigger: uberElement})
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

      if (options.search){
        pane.addContent('search', searchInput)

        // Add a clear search button
        updateClearSearchButtonVisiblity()
        pane.addContent('clearSearchButton', clearSearchButton)
      }

      pane.addContent('results', searchOutput)

      uberElement.insertBefore(select).append(select)


      // BEHAVIOUR

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

      // Clear search button behaviour
      clearSearchButton.on('click', search.clear)
      $(search).on('queryChanged', updateClearSearchButtonVisiblity)


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
          var text = $(this).text() || "&nbsp;"
          var matchValue = $(this).data('match-value') || $(this).text()
          var value = $(this).attr('value') || $(this).text()

          return {text:text, value:value, matchValue:matchValue, visibility:visibility, group:group}
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

      // Match against the datum.matchValue
      function datumPreprocessor(datum){
        return datum.matchValue
      }

      function renderResultsWithGroupSupport(data){
        var list = $('<ul class="results">')
        var dummyNode = $('<div>')
        context = this
        $.each(data, function(_, datum){
          dummyNode.append(
            context.buildResult(datum.text)
            .attr('data-group', datum.group) // Add the group name so we can group items
            .attr('data-value', datum.value) // Store the value so we can get know what the value of the selected item is
          )
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
        var text = $(select).find('option:selected').text()
        if (text) {
          uberText.text(text).removeClass('empty')
        } else {
          uberText.text(placeholder).addClass('empty')
        }
      }

      function markSelected(selectedResult){
        var results = search.getResults()
        $(results).filter('.selected').removeClass('selected')
        $(selectedResult).addClass('selected')
      }

      function updateSelectValue(select, value){
        $(select).val(value).change()
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
        return $(result).attr('data-value')
      }

      function updateClearSearchButtonVisiblity(){
        clearSearchButton.toggle(!!searchInput.val())
      }
    })

    return this
  }
}( jQuery ));
