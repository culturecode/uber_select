
(function( $ ) {
  $.fn.uberSelect = function(opts) {
    this.each(function(){
      var options = $.extend({
        search:true,                          // Show the search input
        clearSearchButton:'&#x2715;',         // Text content of clear search button
        selectCaret: '&#x2304;',              // Text content of select caret
        prepopulateSearchOnOpen: false,       // Should the search input start with the selected value in it when the pane is opened?
        clearSearchClearsSelect: false,       // Should the select value be cleared When the search is cleared?
        hideBlankOption: false,               // Should blank options be hidden automatically?
        treatBlankOptionAsPlaceholder: false, // Should blank options use the placeholder as text?
        minQueryLength: 0,                    // Number of characters to type before results are displayed
        placeholder: null,                    // Placeholder to show in the selected text area
        searchPlaceholder: 'Type to search'   // Placeholder to show in the search input
      }, opts, $(this).data('uber-options'))

      var select            = this
      var placeholder       = $(select).attr('placeholder') || $(select).attr('data-placeholder') || options.placeholder
      var data              = dataFromSelect(this)
      var uberElement       = $('<span class="uber_select">')

      var selectedContainer = $('<span class="selected_text_container">').appendTo(uberElement)
      var selectedText      = $('<span class="selected_text">').appendTo(selectedContainer)
      var selectCaret       = $('<span class="select_caret">').appendTo(selectedContainer).html(options.selectCaret)

      var searchInput       = $('<input type="text" class="search_input">').attr('placeholder', options.searchPlaceholder)
      var searchOutput      = $('<div class="results_container">')
      var clearSearchButton = $('<span class="clear_search_button">').html(options.clearSearchButton)

      var pane   = new Pane({anchor: uberElement, trigger: uberElement})
      var search = new Search(searchInput, searchOutput, {
        model: {
          data: data,
          dataForMatching: dataForMatching,
          datumPreprocessor: datumPreprocessor,
          minQueryLength: options.minQueryLength
        },
        view: {
          renderResults: renderResults,
          buildResult: buildResult
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

      // When the select value changes
      $(select).on('change', function(){
        updateSelectedText()
        markSelected()
      })

      // When the pane is opened
      $(pane).on('shown', function(){
        search.clear()
        $(searchInput).focus()
        uberElement.addClass('open')

        if (options.prepopulateSearchOnOpen){
          updateSearchValueFromSelect()
        }
      })

      // When the query is changed
      $(search).on('queryChanged', updateClearSearchButtonVisiblity)

      // When the search results are rendered
      $(search).on('renderedResults', markSelected)

      // When a search result is chosen
      searchOutput.on('click', '.result', function(){
        pane.hide()
        updateSelectValue(select, valueFromResult(this))
      })

       // When the pane is hidden
      $(pane).on('hidden', function(){
        uberElement.removeClass('open')
      })

      // When the clear search button is clicked
      clearSearchButton.on('click', function(){
        search.clear()
        $(searchInput).focus()

        if (options.clearSearchClearsSelect){
          clearSelect()
        }
      })


      // INITIALIZATION

      $(select).hide()
      markSelected()
      updateSelectedText()

      // HELPER FUNCTIONS

      // Given a select element
      // Returns an array of data to match against
      function dataFromSelect(select){
        return $(select).find('option').map(function(){
          var optgroup = $(this).closest('optgroup')
          var group = optgroup.attr('label')
          var visibility = $(this).data('visibility') || optgroup.data('visibility')
          var text = $(this).text()
          var matchValue = $(this).data('match-value') || text
          var value = $(this).attr('value') || text

          return {text:text, value:value, matchValue:matchValue, visibility:visibility, group:group, element:this}
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

      // Adds group support and blank option hiding
      function renderResults(data){
        var context = this
        var list = $('<ul class="results">')
        var dummyNode = $('<div>')
        $.each(data, function(_, datum){
          var result = context.buildResult(datum)
            .attr('data-value', datum.value) // Store the value so we can get know what the value of the selected item is
            .attr('data-group', datum.group) // Add the group name so we can group items
            .appendTo(dummyNode)

          if (options.hideBlankOption && !datum.text){
            result.hide()
          }
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

        if (data.length == 0) {
          list.append(context.buildNoResult())
              .addClass('empty')
        }

        $(this.resultsContainer).html(list)
      }

      function buildResult(datum){
        var result = $('<li>')
          .html((options.treatBlankOptionAsPlaceholder ? datum.text || placeholder : datum.text) || "&nbsp;")
          .addClass(this.resultClass)

        return result
      }

      // Returns the selected result based on the select's value
      function getSelectedResult(){
        return selectedResultFromValue($(select).val(), search.getResults())
      }

      // Updates the enhanced select with the text of the selected result
      function updateSelectedText(){
        var text = $(select).find('option:selected').text()
        if (text) {
          selectedText.text(text).removeClass('empty')
        } else {
          selectedText.html(placeholder || "&nbsp;").addClass('empty')
        }
      }

      function markSelected(){
        var selectedResult = getSelectedResult()
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

      // Copies the value of the select into the search input
      function updateSearchValueFromSelect(){
        searchInput.val($(select).find('option:selected').text())
        updateClearSearchButtonVisiblity()
      }

      function updateClearSearchButtonVisiblity(){
        clearSearchButton.toggle(!!searchInput.val())
      }

      // Selects the option with an emptystring value, or the first option if there is no blank option
      function clearSelect(){
        $(select).val('').change()
        if (!$(select).find('option:selected').length){
          $(select).val($(select).find('option').prop('value'))
        }
      }
    })

    return this
  }
}( jQuery ));
