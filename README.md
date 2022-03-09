# UberSelect

UberSelect is a fancy UI on top of a regular `<select>` element.

## Requirements

Tested on jQuery 1.11.x to 3.3.x

## Parts

UberSelect is composed of two main parts, an UberSearch that does all the of searching and UI, and an UberSelect which
is used to connect an UberSearch to a `<select>` element.

### UberSelect

This is the object that allows an UberSearch and a `<select>` element to work together. The select element can be used
to control the state of the UberSearch, and vice-versa. This means you can programmatically change the state of the
select, and UberSearch will update. Users can interact with the UberSearch, and the select will update. This also means
you can use UberSelect to gussy up forms, without changing any of the underlying inputs.

#### Usage

```JS
$('.my_selects').uberSelect(options);
```

#### Attributes <a name="UberSearch attributes"></a>

Attribtes on the outermost element can be specified by setting the `data-uber-attributes` attribute on the `<select>` element. Values should be passed
as a JSON string of key/value pairs where the key is the attribute name and the value is the attribute value.

#### Options

Options can be specified by setting the `data-uber-options` attribute on the `<select>` element. Values should be passed
as a JSON string. All options on the are passed to the underlying UberSearch, see [UberSearch options](#UberSearchOptions).

- ##### prepopulateSearchOnOpen

  Determines whether the search input starts with the selected value in it when the pane is opened.

  Default: `false`

- ##### clearSearchClearsSelect

  Determines whether the select value should be cleared when the search is cleared.

  Default: `false`

- ##### placeholder

  Placeholder to show in the selected text area.

  Default: `<select>` element attributes `<select placeholder="my placeholder" data-placeholder="my placeholder">`

- ##### dataUrl <a name="dataUrl"></a>

  A url to pre-fetch select options from. JSON response should be of the form
  `[{text:'option with explicit value', value: 'some value'}, {text:'option with implicit value'}]`. For a custom JSON response, use in conjunction with optionFromDatum.

  Default: `null`

- ##### dataFormatter

  A function that can modify the data from the dataUrl before it is used.

  The function signature is as follows:

  ```js
    function(data) {
      // Modify the data

      return modifiedData
    }
  ```
  See <a href="#dataUrl">dataUrl</a> for details about the expected format of `data`.

- ##### optionFromDatum

  A function that is used to customize the options value and text built from a JSON response. `datum` is a single result returned from the JSON response.

  The function signature is as follows:

  ```js
    function(datum) {
      return // a <option> element to represent the select
    }
  ```

   Default: `datum.value` populates the `<option>` value, `datum.text` populates the `<option>` text.

- ##### value

  Initialize the UberSearch with this selected value

  Default: `<select>` element `value` property

- ##### ariaLabel

  Add an aria-label attribute with this value to the uber_select element.

#### Events Triggered

- ##### uber-select:ready

  This fires when the UberSelect has initialized and is ready for user interaction

#### Events Observed

The `<select>` element observes the following events:

- ##### uber-select:refreshOptions

  The UberSearch options list will be updated to match the `<select>` element's `<option>` list.

- ##### uber-select:refresh

  The UberSearch will update its selected value to match the `<select>` element's. This handler also runs when the
  `<select>` element triggers a `change` event.

### UberSearch

The UberSearch performs all of the heavy lifting. It creates the UI views, maintains state, and performs the searching.
It can be instantiated without the use of an UberSelect, which can be useful for situations where the selected value is
being used in purely in JS, and not being linked to a `<select>` element in a form.

#### Usage

```JS
new UberSearch(data, options);
```

#### Data

Data is an array of objects. Each object may have the following properties:

- ##### text

  String shown to the user in the list of results. This value is required if *value* is not provided.

- ##### selectedText

  String shown to the user in the output container when this option is selected. *optional*

- ##### title

  Title text shown to the user when hovering over the result. *optional*

- ##### value

  This is matched against the *value* option passed UberSearch and will appear selected if it matches. It is also used to match against search input text when the user searches. This value is required if *text* is not provided.

- ##### matchValue

  This overrides the value used to match against search input text when the user searches. *optional*

- ##### visibility

  This is used to determine whether the option appears only when searching or only when not searching. Values accepted: `query`, `no-query`. *optional*

- ##### disabled

  This is used to determine whether the option appears disabled. *optional*

- ##### group

  This is used to visually group options. All options with the same group will appear together. *optional*

#### Methods

- ##### setData(data)

  Sets the data. `data` should be an Array conforming to the specifications described in <a href="#data">Data</a>

- ##### getValue()

  Returns the currently selected value.

- ##### getSelection()

  Returns the currently selected element from the search results.


#### Options <a name="UberSearch options"></a>

Options can be specified by setting the `data-uber-options` attribute on the `<select>` element. Values should be passed
as a JSON string.

- ##### value

  Sets the initially selected value of the UberSearch. This value should match the `value` property of the desired
  option data.

  Default: `null`

- ##### search

  Determines whether the search input be shown.

  Default: `true`

- ##### clearSearchButton

  Sets the text content of clear search button.

  Default: `✕`

- ##### selectCaret

  Sets the text content of clear select caret.

  Default: `⌄`

- ##### hideBlankOption

  Sets whether blank options should be hidden automatically.

  Default: `false`

- ##### treatBlankOptionAsPlaceholder

  Determines whether the `text` property of an option with a blank `value` property should be used as the placeholder
  text if no placeholder is specified.

  Default: `false`

- ##### highlightByDefault

  Determines whether the first search result be auto-highlighted.

  Default: `true`

- ##### minQueryLength

  Sets minimum number of characters the user must type before a search will be performed.

  Default: `0`

- ##### minQueryMessage

  Sets the message shown to the user when the query doesn't exceed the minimum length. `true` for a default message,
  `false` for none, or provide a string to set a custom message.

  Default: `true`

- ##### placeholder

  Sets the placeholder shown in the selected text area.

  Default: `null`

- ##### searchPlaceholder

  Sets the placeholder shown in the search input.

  Default: `'Type to search'`

- ##### noResultsText

  Sets the message shown when there are no results.

  Default: `'No Matches Found'`

- ##### noDataText

  Sets the text to show when the results list is empty and no search is in progress

  Default: `'No options'`

- ##### searchInputAttributes

  An Object containing attributes to add to the search input element.

- ##### buildResult

  A function that is used to build result elements.

  The function signature is as follows:

  ```js
    function(listOptionData) {
      return // HTML/element to insert into the the results list
    }
  ```

- ##### resultPostprocessor

  A function that is run after a result is built and can be used to decorate it. This can be useful when extending the
  functionality of an existing UberSearch implementation.

  The function signature is as follows:

  ```js
    function(resultsListElement, listOptionData) { }
  ```

  Default: No-op

- ##### onRender

  A function to run when the results container is rendered. If the result returns false, the default `render` event
  handler is not run and the event is cancelled.

  The function signature is as follows:

  ```js
  function(resultsContainer, searchResultsHTML) { }
  ```

- ##### onSelect

  A function to run when a result is selected. If the result returns false, the default `select` event handler is not
  run and the event is cancelled.

  The function signature is as follows:

  ```js
  function(listOptionData, resultsListElement, clickEvent) { }
  ```

- ##### onNoHighlightSubmit

  A function to run when a user presses enter without selecting a result.
  Should be used in combination with `highlightByDefault: false`.

  The function signature is as follows:

  ```js
  function(value) { }
  ```

- ##### outputContainer (Deprecated)

  An object that receives the output once a result is selected. Must respond to `setValue(value)` and `view()`. This object serves to
  attach the result list to the DOM at the desired location.

#### Events Triggered

- ##### shown

  This fires when the UberSearch pane is opened.

- ##### renderedResults

  This fires each time the list of results is updated.

- ##### clear

  This fires when the user clicks the clear search button.

- ##### select

  This fires when the user selects a result.

  The handler function signature is as follows:

  ```js
  function(event, [listOptionData, resultsContainer, originalEvent]) { }
  ```
