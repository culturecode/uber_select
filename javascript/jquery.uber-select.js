(function( $ ) {
  var eventsTriggered = {
    ready: 'uber-select:ready'
  }
  var eventsObserved = {
    refreshOptions: 'uber-select:refreshOptions',
    refresh: 'uber-select:refresh change',
  }

  $.fn.uberSelect = function(opts) {
    this.each(function(){
      if (this.uberSearch) { return } // Prevent multiple initializations on the same element
      var select = this
      var options = $.extend({
        prepopulateSearchOnOpen: false,                                                   // Should the search input start with the selected value in it when the pane is opened?
        clearSearchClearsSelect: false,                                                   // Should the select value be cleared When the search is cleared?
        disabled: $(select).is(':disabled'),                                              // Whether the select is currently disabled
        placeholder: $(select).attr('placeholder') || $(select).attr('data-placeholder'), // Placeholder to show in the selected text area
        dataUrl: null,                                                                    // A url to pre-fetch select options from, see optionsFromData for data format
        optionFromDatum: optionFromDatum,                                                 // A function to create select options
        value: $(select).val()                                                            // Initialize the UberSearch with this selected value
      }, opts, $(select).data('uber-options'))
      var uberAttributes = $(select).data('uber-attributes');                             // Attributes defined as data-uber-attributes on the original select element. These will be added as attributes on the uberSelect element.
      var uberSearch = this.uberSearch = new UberSearch(dataFromSelect(select), options)


      // BEHAVIOUR

      // When the UberSearch pane is opened
      $(uberSearch).on('shown', function(){
        if (options.prepopulateSearchOnOpen){
          updateSearchValueFromSelect()
        }
      })

      // When the clear search button is clicked
      $(uberSearch).on('clear', function(){
        if (options.clearSearchClearsSelect){
          clearSelect()
        }
      })

      // When the list values change
      $(select).on(eventsObserved.refreshOptions, refreshOptionsList)

      // When the select value changes
      $(select).on(eventsObserved.refresh, refresh)

      // When a result is selected
      $(uberSearch).on('select', function(_, datum){
        updateSelectValue(datum.value)
      })

      // INITIALIZATION

      if (uberAttributes) {
        uberSearch.view.attr(uberAttributes)
      }

      uberSearch.view.insertBefore(select).append(select)
      hideSelect()
      if (options.dataUrl) {
        $.getJSON(options.dataUrl).done(function(data){
          $(select).append(optionsFromData(data))
          updateSelectValue(options.value)
          uberSearch.setData(dataFromSelect(select))
          $(select).trigger(eventsTriggered.ready)
        })
      } else {
        $(select).trigger(eventsTriggered.ready)
      }


      // HELPER FUNCTIONS

      // Given a select element
      // Returns an array of data to match against
      function dataFromSelect(select){
        var opts = $(select).find('option')
        var datum;
        var parent;

        return $.map(opts, function(option){
          // This is optimized for performance and does not use jQuery convenience methods. Seems to be about 30% faster loading during non-scientific tests.
          datum = {
            text: option.textContent,
            selectedText: getAttribute(option, 'data-selected-text'),
            value: getAttribute(option, 'value'),
            title: getAttribute(option, 'title'),
            disabled: getAttribute(option, 'disabled') === undefined ? false : true,
            matchValue: getAttribute(option, 'data-match-value'),
            visibility: getAttribute(option, 'data-visibility'),
            element: option
          }

          parent = option.parentElement
          if (parent.nodeName == 'OPTGROUP') {
            datum.group = getAttribute(parent, 'label')
            datum.visibility = datum.visibility || getAttribute(parent, 'data-visibility')
          }

          return datum
        })
      }

      // Generates select options from data
      function optionsFromData(data){
        var elements = []
        var groups = {}
         $.each(data, function(_, datum){
          if (datum.group) {
            groups[datum.group] || elements.push(groups[datum.group] = groupFromDatum(datum))
            groups[datum.group].append(options.optionFromDatum(datum))
          } else {
            elements.push(options.optionFromDatum(datum))
          }
        })

        return elements
      }

      function getAttribute(element, attribute) {
        var value = element.getAttribute(attribute)
        return value === null ? undefined : value // Allow $.extend to overwrite missing attributes by setting them to undefined
      }

      function groupFromDatum(datum){
        return $('<optgroup>').attr('label', datum.group)
      }

      function optionFromDatum(datum){
        return $('<option>').attr('value', datum.value || datum.text).text(datum.text || datum.value)
      }

      // Copies the value of the select into the search input
      function updateSearchValueFromSelect(){
        uberSearch.searchField.input.val($(select).find('option:selected').text())
        uberSearch.searchField.refresh()
      }

      function refreshOptionsList(){
        uberSearch.setData(dataFromSelect(select))
        updateSelectValue($(select).find('option[selected]').attr('value')) // Read the value of the option that is selected because the <select> element's value is defunct now that we've updated the <option> elements
      }

      function refresh(){
        uberSearch.setDisabled($(select).is(':disabled'))
        uberSearch.setValue($(select).val())
      }

      function updateSelectValue(value){
        var before = $(select).val()
        $(select).val(value)
        var after = $(select).val() // Read value the same way instead of comparing to `value` so the same coercion is applied
        if (before != after) { $(select).trigger('change') } // Only trigger a change if the value has actually changed
      }

      // Selects the option with an emptystring value, or the first option if there is no blank option
      function clearSelect(){
        var selectValue = $(select).val()

        // If the select is already cleared, avoid firing a change event
        if (!selectValue) { return }

        // Clear the value
        $(select).val('').trigger('change')

        // If that cleared it then we're done, otherwise, select the first option
        if ($(select).find('option:selected').length){ return }

        var firstOptionValue = $(select).find('option').prop('value')

        // If the first option is already set then we're done, otherwise, select the first option
        if (firstOptionValue == selectValue) { return }

        // Select the first option
        $(select).val(firstOptionValue).trigger('change')
      }

      // Hide the select, but keep its width to allow it to set the min width of the uber select
      // NOTE: IE doesn't like 0 height, so give it 1px height and then offset
      function hideSelect(){
        $(select).wrap($('<div>').css({visibility: 'hidden', height: '1px', marginTop: '-1px', pointerEvents: 'none'}).addClass('select_width_spacer'))
      }
    })

    return this
  }
}( jQuery ));
