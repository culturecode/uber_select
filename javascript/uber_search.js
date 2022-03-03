var UberSearch = function(data, options){
  var eventsTriggered = {
    shown: 'shown',
    renderedResults: 'renderedResults',
    clear: 'clear',
    select: 'select'
  }

  options = $.extend({
    ariaLabel: null,
    value: null,                                      // Initialize with this selectedValue
    disabled: false,                                  // Initialize with this disabled value
    search: true,                                     // Show the search input
    clearSearchButton:'&#x2715;',                     // Text content of clear search button
    selectCaret: '&#x2304;',                          // Text content of select caret
    hideBlankOption: false,                           // Should blank options be hidden automatically?
    treatBlankOptionAsPlaceholder: false,             // Should blank options use the placeholder as text?
    highlightByDefault: true,                         // Should the first result be auto-highlighted?
    minQueryLength: 0,                                // Number of characters to type before results are displayed
    minQueryMessage: true,                            // Message to show when the query doesn't exceed the minimum length. True for default, false for none, or custom message.
    placeholder: null,                                // Placeholder to show in the selected text area
    searchPlaceholder: 'Type to search',              // Placeholder to show in the search input
    noResultsText: 'No Matches Found',                // The message shown when there are no results
    resultPostprocessor: function(result, datum){},   // A function that is run after a result is built and can be used to decorate it
    buildResult: null,                                // A function that is used to build result elements
    outputContainer: null,                            // An object that receives the output once a result is selected. Must respond to setValue(value), and view()
    onRender: function(resultsContainer, result) {},  // A function to run when the results container is rendered. If the result returns false, the default select handler is not run and the event is cancelled
    onSelect: function(datum, result, clickEvent) {}, // A function to run when a result is selected. If the result returns false, the default select handler is not run and the event is cancelled
    onNoHighlightSubmit: function(value) {},          // A function to run when a user presses enter without selecting a result.
    noDataText: 'No options'                          // Text to show in there is nothing in the set of data to pick from
  }, options)

  var context          = this
  var view             = $('<span class="uber_select" role="listbox"></span>')
  var selectedValue    = options.value // Internally selected value
  var outputContainer  = options.outputContainer || new OutputContainer({selectCaret: options.selectCaret})
  var resultsContainer = $('<div class="results_container"></div>')
  var messages         = $('<div class="messages"></div>')
  var pane             = new Pane()

  if (options.ariaLabel) { view.attr("aria-label", options.ariaLabel) }

  var searchField = new SearchField({
      placeholder: options.searchPlaceholder,
      clearButton: options.clearSearchButton,
      searchInputAttributes: options.searchInputAttributes
  })

  var search = new Search(searchField.input, resultsContainer, {
    model: {
      dataForMatching: dataForMatching,
      minQueryLength: options.minQueryLength,
      queryPreprocessor: options.queryPreprocessor || Search.prototype.queryPreprocessor,
      datumPreprocessor: options.datumPreprocessor || datumPreprocessor,
      patternForMatching: options.patternForMatching || Search.prototype.patternForMatching
    },
    view: {
      renderResults: renderResults,
      buildResult: options.buildResult || buildResult,
      keypressInput: options.search ? searchField.input : null
    }
  })


  // BEHAVIOUR

  // Show the pane when the select element is clicked
  $(outputContainer.view).on('click', function(event){
    if (outputContainer.view.hasClass('disabled')) { return }

    pane.show()
  })

  // Hide the pane when clicked out or another pane is opened
  $(document).on('click shown.UberSelect', function(event){
    if (isEventOutsidePane(event) && isEventOutsideOutputContainer(event)){
      pane.hide()
    }
  })

  // Show the pane if the user was tabbed onto the trigger and pressed enter, space, or down arrow
  $(outputContainer.view).on('keyup', function(event){
    if (outputContainer.view.hasClass('disabled')) { return }

    if (event.which === 40 && !pane.isClosed()){ // Select the first result when down arrow is pressed while open
      search.setHighlight(0)
      return false
    }

    if (event.which === 32 || event.which === 40 && pane.isClosed()){ // Show the pane when the space or down key is pressed
      pane.show()
      search.setHighlight(0)
      return false
    }

    else if (event.which === 13){ // toggle pane when enter is pressed
      pane.toggle()
      return false
    }
  })

  // When the pane is opened
  $(pane).on('shown', function(){
    search.clear()
    markSelected()
    view.addClass('open')

    if (options.search) {
      $(searchField.input).focus()
    } else {
      pane.view.find("ul.results li:first").focus()
    }

    triggerEvent(eventsTriggered.shown)
  })

  // When the pane is hidden
  $(pane).on('hidden', function(){
    view.removeClass('open')
    view.focus()
  })

  // When the query is changed
  $(search).on('queryChanged', function(){
    updateMessages()
  })

  // When the search results are rendered
  $(search).on('renderedResults', function(event){
    if (options.onRender(resultsContainer, getSelection()) === false) {
      event.stopPropagation()
      return
    }

    markSelected()
    updateMessages()
    triggerEvent(eventsTriggered.renderedResults)
  })

  // When the search field is cleared
  $(searchField).on('clear', function(){
    triggerEvent(eventsTriggered.clear)
  })

  // When a search result is chosen
  resultsContainer.on('click', '.result:not(.disabled)', function(event){
    var datum = $(this).data()

    if (options.onSelect(datum, this, event) === false) {
      event.stopPropagation()
      return
    }

    event.stopPropagation();

    setValue(valueFromResult(this))
    pane.hide()
    triggerEvent(eventsTriggered.select, [datum, this, event])
  })

  // When query is submitted
  $(searchField.input).on('noHighlightSubmit', function(event) {
    options.onNoHighlightSubmit($(this).val())
  })


  // INITIALIZATION

  setDisabled(options.disabled)
  setData(data)

  if (options.search) { pane.addContent('search', searchField.view) }
  pane.addContent('messages', messages)
  pane.addContent('results', resultsContainer)

  // If the output container isn't in the DOM yet, add it
  if (!$(outputContainer.view).closest('body').length){
    $(outputContainer.view).appendTo(view)
  }

  $(view).append(pane.view)

  updateMessages()
  updateSelectedText()
  markSelected()


  // HELPER FUNCTIONS

  function setData(newData){
    data = setDataDefaults(newData)
    search.setData(data)
    updateSelectedText()
    markSelected()
  }

  // Selects the result corresponding to the given value
  function setValue(value){
    if (selectedValue == value) { return }
    selectedValue = value
    updateSelectedText()
    markSelected()
  }

  // Returns the selected value
  function getValue(){
    return selectedValue
  }

  // Enables or disables UberSearch
  function setDisabled(boolean){
    outputContainer.setDisabled(boolean)
  }

  // Updates the enhanced select with the text of the selected result
  function setSelectedText(text){
    if (text) {
      outputContainer.setValue(text)
    } else {
      outputContainer.setValue(options.placeholder)
    }
  }

  // Inherit values for matchValue and value from text
  function setDataDefaults(data){
    return $.map(data, function(datum) {
      return $.extend({ value: datum.text, matchValue: datum.text }, datum)
    })
  }

  // Converts the dataFromSelect into a datum list for matching
  function dataForMatching(processedQuery, data){
    // If a query is present, include only select options that should be used when searching
    // Else, include only options that should be visible when not searching
    if (processedQuery) {
      return $.map(data, function(datum){ if (datum.visibility != 'no-query' || datum.value == selectedValue) return datum })
    } else {
      return $.map(data, function(datum){ if (datum.visibility != 'query' || datum.value == selectedValue) return datum })
    }
  }

  // Match against the datum.matchValue
  function datumPreprocessor(datum){
    return datum.matchValue
  }

  // Adds group support and blank option hiding
  function renderResults(data){
    var context = this
    var sourceArray = []

    $.each(data, function(_, datum){
      // Add the group name so we can group items
      var result = context.buildResult(datum).attr('data-group', datum.group)

      // Omit blank option from results
      if (!options.hideBlankOption || datum.value){
        sourceArray.push(result)
      }
    })

    // Arrange ungrouped list items
    var destArray = reject(sourceArray, 'li:not([data-group])')

    // Arrange list items into sub lists
    while (sourceArray.length) {
      var group       = $(sourceArray[0]).attr('data-group')
      var groupNodes  = reject(sourceArray, 'li[data-group="' + group + '"]')
      var sublist     = $('<ul class="sublist"></ul>').attr('data-group', group)
      var sublistNode = $('<li></li>').append('<span class="sublist_name">' + group + '</span>')

      sublist.append(groupNodes)
      sublistNode.append(sublist)

      destArray.push(sublistNode)
    }

    this.view.toggleClass('empty', !destArray.length)
    this.view.html(destArray)
  }

  // Removes elements from the sourcArray that match the selector
  // Returns an array of removed elements
  function reject(sourceArray, selector){
    var dest = filter(sourceArray, selector)
    var source = filter(sourceArray, selector, true)
    sourceArray.splice(0, sourceArray.length)
    sourceArray.push.apply(sourceArray, source)
    return dest
  }

  function filter(sourceArray, selector, invert){
    return $.grep(sourceArray, function(node){ return node.is(selector) }, invert)
  }

  function buildResult(datum){
    var result = $('<li class="result" tabindex="0"></li>')
      .html((options.treatBlankOptionAsPlaceholder ? datum.text || options.placeholder : datum.text) || "&nbsp;")
      .data(datum) // Store the datum so we can get know what the value of the selected item is

    if (datum.title) { result.attr('title', datum.title) }
    if (datum.disabled) { result.addClass('disabled') }

    options.resultPostprocessor(result, datum)

    return result
  }

  function markSelected(){
    var selected = getSelection()
    var results = search.getResults()

    $(results).filter('.selected').not(selected).removeClass('selected')

    // Ensure the selected result is unhidden
    $(selected).addClass('selected').removeClass('hidden')

    if (selected) {
      search.highlightResult(selected)
    } else if (options.highlightByDefault) {
      search.highlightResult(results.not('.hidden').not('.disabled').first())
    }
  }

  // Returns the selected element and its index
  function getSelection(){
    var results = search.getResults()
    var selected
    $.each(results, function(i, result){
      if (selectedValue == valueFromResult(result)){
        selected = result
        return false
      }
    })
    return selected
  }

  function valueFromResult(result){
    return $(result).data('value')
  }

  function updateSelectedText(){
    setSelectedText(textFromValue(selectedValue))
  }

  function textFromValue(value){
    return $.map(data, function(datum) {
      if (datum.value == value)  {
        return datum.selectedText || datum.text
      }
    })[0]
  }

  function updateMessages(){
    messages.show()
    if (!queryLength() && !resultsCount()){
      messages.html(options.noDataText)
    } else if (options.minQueryLength && options.minQueryMessage && queryLength() < options.minQueryLength){
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
    return search.getResults().length
  }

  // returns true if the event originated outside the pane
  function isEventOutsidePane(event){
    return !$(event.target).closest(pane.view).length
  }

  function isEventOutsideOutputContainer(event){
    return !$(event.target).closest(outputContainer.view).length
  }

  // Allow observer to be attached to the UberSearch itself
  function triggerEvent(eventType, callbackArgs){
    view.trigger(eventType, callbackArgs)
    $(context).trigger(eventType, callbackArgs)
  }

  // PUBLIC INTERFACE

  $.extend(this, {view:view,  searchField:searchField, setValue:setValue, getValue: getValue, setData:setData, setDisabled:setDisabled, getSelection:getSelection, options:options})
}
