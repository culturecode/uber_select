var UberSearch = function(data, options){
  options = $.extend({
    search:true,                                     // Show the search input
    clearSearchButton:'&#x2715;',                    // Text content of clear search button
    selectCaret: '&#x2304;',                         // Text content of select caret
    hideBlankOption: false,                          // Should blank options be hidden automatically?
    treatBlankOptionAsPlaceholder: false,            // Should blank options use the placeholder as text?
    minQueryLength: 0,                               // Number of characters to type before results are displayed
    minQueryMessage: true,                           // Message to show when the query doesn't exceed the minimum length. True for default, false for none, or custom message.
    placeholder: null,                               // Placeholder to show in the selected text area
    searchPlaceholder: 'Type to search',             // Placeholder to show in the search input
    noResultsText: 'No Matches Found',               // The message shown when there are no results
    resultPostprocessor: function(result, datum){},  // A function that is run after a result is built and can be used to decorate it
    onSelect: function(value, result){}              // A function to run after a result is selected
  }, options)

  var context           = this
  var view              = $('<span class="uber_select"></span>')
  var selectedValue     // Internally selected value

  var selectedContainer = $('<span class="selected_text_container" tabindex=0 role="button"></span>').appendTo(view)
  var selectedText      = $('<span class="selected_text"></span>').appendTo(selectedContainer)
  var selectCaret       = $('<span class="select_caret"></span>').appendTo(selectedContainer).html(options.selectCaret)

  var searchField       = new SearchField({placeholder: options.searchPlaceholder, clearButton: options.clearSearchButton})
  var searchOutput      = $('<div class="results_container"></div>')
  var messages          = $('<div class="messages"></div>')

  var pane   = new Pane({anchor: view, trigger: selectedContainer})
  var search = new Search(searchField.input, searchOutput, {
    model: {
      data: setDataDefaults(data),
      dataForMatching: dataForMatching,
      minQueryLength: options.minQueryLength,
      queryPreprocessor: options.queryPreprocessor || Search.prototype.queryPreprocessor,
      datumPreprocessor: options.datumPreprocessor || datumPreprocessor,
      patternForMatching: options.patternForMatching || Search.prototype.patternForMatching
    },
    view: {
      renderResults: renderResults,
      buildResult: buildResult
    }
  })


  // BEHAVIOUR

  // When the pane is opened
  $(pane).on('shown', function(){
    search.clear()
    unhighlightResults()
    $(searchField.input).focus()
    view.addClass('open')

    $(context).trigger('shown')
  })

  // When the query is changed
  $(search).on('queryChanged', function(){
    updateMessages()
  })

  // When the search results are rendered
  $(search).on('renderedResults', function(){
    markSelected()
    updateMessages()
  })

  // When the search field is cleared
  $(searchField).on('clear', function(){
    $(context).trigger('clear')
  })

  // Handle up and down arrow key presses
  $(searchField.input).on('keydown', function(event){
    switch (event.which) {
      case 38: // Up Arrow
        stepHighlight(-1, true)
        break
      case 40: // Down Arrow
        stepHighlight(1)
        break
      case 13: // Enter
        highlightedResult().click()
        break
    }
  })

  // When a search result is chosen
  searchOutput.on('click', '.result', function(){
    setValue(valueFromResult(this))
    pane.hide()
    var datum = $(this).data()
    options.onSelect(datum, this)
    $(context).trigger('select', [datum, this])
  })

   // When the pane is hidden
  $(pane).on('hidden', function(){
    view.removeClass('open')
  })


  // INITIALIZATION

  if (options.search){
    pane.addContent('search', searchField.view)
    pane.addContent('messages', messages)
  }
  pane.addContent('results', searchOutput)
  updateMessages()
  setSelectedText()


  // HELPER FUNCTIONS

  // Selects the result corresponding to the given value
  function setValue(value){
    if (selectedValue == value) { return }
    selectedValue = value
    setSelectedText(textFromResult(getSelectedResult()))
    markSelected()
  }

  // Updates the enhanced select with the text of the selected result
  function setSelectedText(text){
    if (text) {
      selectedText.text(text).removeClass('empty')
    } else {
      selectedText.html(options.placeholder || "&nbsp;").addClass('empty')
    }
  }

  // Inherit values for matchValue and value from text
  function setDataDefaults(data){
    $.each(data, function(){
      this.matchValue = this.matchValue || this.text
      this.value = this.value || this.text
    })
    return data
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
    var list = $('<ul class="results"></ul>')
    var dummyNode = $('<div></div>')
    $.each(data, function(_, datum){
      var result = context.buildResult(datum)
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
      var sublist = $('<ul class="sublist"></ul>').attr('data-group', group)
      dummyNode.find('li[data-group="' + group + '"]').appendTo(sublist)
      $('<li></li>')
        .append('<span class="sublist_name">' + group + '</span>')
        .append(sublist).appendTo(list)
    }

    if (data.length == 0) {
      list.addClass('empty')
    }

    $(this.resultsContainer).html(list)
  }

  function buildResult(datum){
    var result = $('<li></li>')
      .html((options.treatBlankOptionAsPlaceholder ? datum.text || options.placeholder : datum.text) || "&nbsp;")
      .addClass(this.resultClass)
      .data(datum) // Store the datum so we can get know what the value of the selected item is

    options.resultPostprocessor(result, datum)

    return result
  }

  function markSelected(){
    var selectedResult = getSelectedResult()
    var results = search.getResults()
    $(results).filter('.selected').removeClass('selected')
    $(selectedResult).addClass('selected')
  }

  // Returns the selected result based on the selectedValue
  function getSelectedResult(){
    return selectedResultFromValue(selectedValue, search.getResults())
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
    return $(result).data('value')
  }

  function textFromResult(result){
    return $(result).data('text')
  }

  function updateMessages(){
    messages.show()
    if (options.minQueryLength && options.minQueryMessage && queryLength() < options.minQueryLength){
      messages.html(options.minQueryMessage === true ? 'Type at least ' + options.minQueryLength + (options.minQueryLength == 1 ? ' character' : ' characters') + ' to search' : options.minQueryMessage)
    } else if (options.noResultsText && !resultsCount()){
      messages.html(options.noResultsText)
    } else {
      messages.empty().hide()
    }
  }

  function queryLength(){
    return search.getQuery().length
  }

  function resultsCount(){
    return results().length
  }

  function stepHighlight(amount, allowUnhighlight){
    var index = visibleResults().index(highlightedResult())
    var result = visibleResults()[index + amount]

    if (result || allowUnhighlight){
      unhighlightResults()
      highlightResult(result)
    }
  }

  function highlightResult(result){
    result = $(result)
    if (!result.length) { return }

    result.addClass('highlighted')
    scrollResultIntoView(result)
  }

  function unhighlightResults(){
    highlightedResult().removeClass('highlighted')
  }

  function highlightedResult(){
    return results().filter('.highlighted')
  }

  function visibleResults(){
    return results().filter(':visible')
  }

  function results(){
    return searchOutput.find('.result')
  }

  function scrollResultIntoView(result){
    result = $(result)
    var container = result.closest('.results').css('position', 'relative') // Ensure the results container is positioned so offset is calculated correctly
    var containerHeight = container.height()
    var containerTop = container.get(0).scrollTop
    var containerBottom = containerTop + containerHeight
    var resultHeight = result.height()
    var resultTop = result.get(0).offsetTop
    var resultBottom = resultTop + resultHeight

    if (containerBottom < resultBottom){
      container.scrollTop(resultBottom - containerHeight)
    } else if (containerTop > resultTop){
      container.scrollTop(resultTop)
    }
  }


  // PUBLIC INTERFACE

  $.extend(this, {view:view,  searchField:searchField, setValue:setValue})
}
