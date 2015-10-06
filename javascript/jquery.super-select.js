
(function( $ ) {
  $.fn.uberSelect = function(options) {
    this.each(function(){
      options          = $.extend({}, options)
      var select       = this
      var data         = dataFromSelect(this)
      var uberElement  = $('<span class="uber_select">')
      var uberText     = $('<span class="selected_text">').appendTo(uberElement)
      var searchInput  = $('<input type="search" class="search_input">')
      var searchOutput = $('<div class="results_container">')
      var search       = new Search(searchInput, searchOutput, { model:{ data:data } })
      var pane         = new Pane({anchor: 'body', trigger: uberElement})

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

      // INITIALIZATION
      $(select).hide()
      markSelected(getSelectedResult())
      pane.hide()
      search.clear()
      updateUberElement()

      // HELPER FUNCTIONS

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

      // Given a select element
      // Returns an array of data to match against
      function dataFromSelect(select){
        return $(select).find('option').map(function(){
          var value = $(this).data('match-value')
          if (value === undefined || value === null){
            value = $(this).val()
          }
          return value
        })
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
