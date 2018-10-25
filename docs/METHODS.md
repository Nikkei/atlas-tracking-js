# List of Methods

## Fundamentals

### config(object)

Configure ATJ core.
For more detail, read [Configuration Guide](./CONFIGURATION.md#library-level-configuration-parameters-for-config).

- Parameters
    - object (map : an object containing the ATJ core level configurations)
- Return
    - void


### initPage(object)

Initialize page level variables and event listeners.
For more detail, read [Configuration Guide](./CONFIGURATION.md#page-level-configuration-parameters-for-initpage).

- Parameters
    - object (map : an object containing the page level configurations)
- Return
    - void


### trackPage()

Send a beacon as a pageview.
This method automatically generate an action with `action=view` and `category=page`.

- Parameters
    - void
- Return
    - void


### trackAction(action, category, events, object)

Send a beacon as a custom action.
Strongly recommend to specify `action` and `category`. Also action and category must be coarse granularity.

For example, if you want to measure clicks on "save to favorite items" button in the header of the page:

|Valuation|Action|Category|Object|Note|
|:----:|:----:|:----:|:----:|:----:|
|Good|`click`|`button`|`{loc:'header',fnc:'save',tgt:'favorite-items'}`|Add some context into the fourth parameter to identify the button feature and the location|
|Bad|`click-to-save`|`favorite-items-header-button`|`{}`|This could be a problem when you calculate "total clicks on all buttons" by combining multiple patterns|

- Parameters
    - action (string : optional.a verb or a verbal noun which describes the action. ex. `click`, `open`, `receive`)
    - category (string : optional.a noun or a object which means the target to be applied the action to. ex. `button`, `link`, `notification`)
    - events (string : optional.a comma separated event names or single event name if you want to set. ex. `purchase`)
    - object (map : optional.an object including custom variables)
- Return
    - void


## For retrieving values from outside of ATJ

### getQueryValue(keyName)

Parse and get a value of specified key from GET query parameter in the current URL.

- Parameters
    - keyName (string : a key name)
- Return
    - A value of {keyName} in GET parameter

```javascript
// Retrieve a value of "cid" and set it as tracking_code
context.tracking_code = atlasTracking.getQueryValue('cid');
```


### getCookieValue(keyName)

Parse and get a value of specified key from Cookies of the browser.

- Parameters
    - keyName (string : a key name)
- Return
    - A value of {keyName} in Cookies

```javascript
// Retrieve a value of "uid" and set it as user_id
user.user_id = atlasTracking.getCookieValue('uid');
```


### getLocalStorageValue(keyName)

Select a value of specified key from Local Storage of the browser.

- Parameters
    - keyName (string : a key name)
- Return
    - A value of {keyName} in Local Storage

```javascript
// Retrieve a value of "flags" and parse and set it as flags
context.flags = JSON.parse(atlasTracking.getLocalStorageValue('flags'));
```

### setDataSrc(jsonString)

Parse a custom data object sourced from outside of ATJ, and then store the data in a temporary variable in ATJ object.

- Parameters
    - jsonString (string : a stringified JSON text)
- Return
    - A map object based on jsonString

```javascript
// Feed a custom data object to ATJ through GET parameter
atlasTracking.setDataSrc(atlasTracking.getQueryValue('custom_data'));
```


### getDataFromSrc(mapPath)

Select a value from the custom object parsed by `setDataSrc()` by specifying a JSON path.

- Parameters
    - mapPath (string : a path to the variable you want to select)
- Return
    - A value of {mapPath} stored in the temporary variable of DataSrc

```javascript
// Pick up and set a pagename from DataSrc which is provided from outside of ATJ
context.page_name = atlasTracking.getDataFromSrc('page_data.name');
```


## For managing values in the ingest

### setCustomObject(keyName, object)

Add a key-value pair into custom_object which is an object to store custom data.
custom_object is able to contain a large object up to 64kb but need to consider with the total request size of single beacon.

- Parameters
    - keyName (string : a name of key to be added)
    - object (String, Number, Map, Array : any value)
- Return
    - void

```javascript
// Set the detail of A/B testing into Custom Object
atlasTracking.setCustomObject('ab_testing', {target_user:true,pattern_name:'onboarding_cp',creative_id:'benefit_offering_001'});
```

### delCustomObject(keyName)

Remove the particular data specified by keyName from custom_object.

- Parameters
    - keyName (string : a name of key to be removed)
- Return
    - void

```javascript
// Remove the detail of A/B testing from Custom Object
atlasTracking.delCustomVars('ab_testing');
```


### setCustomVars(keyName, object)

Add the custom variable to just under Context.

- Parameters
    - keyName (string : a name of key to be added)
    - object (String, Number, Map, Array : any value)
- Return
    - void

```javascript
// Set "flags" from the global object named "analytics_data"
atlasTracking.setCustomVars('flags', window.analytics_data);
```

### delCustomVars(keyName)

Remove the particular variable specified by keyName from just under Context.

- Parameters
    - keyName (string : a name of key to be removed)
- Return
    - void

```javascript
// Remove the variable named "flags" from Context
atlasTracking.delCustomVars('flags');
```


### setCustomId(keyName, customID)

Add an alternative information to identify the user by different system.
If you are using multiple tools to execute analytics and/or marketing on your web site, you can combine data across multiple tools by using custom ID as a key.

- Parameters
    - keyName (string : a name of key to be added)
    - customID (string : custom ID)
- Return
    - void

```javascript
// Add Rtoaster's ID into user.external_ids
atlasTracking.setCustomId('rtoaster', 'abc123');
```


### delCustomId(keyName)

Remove the custom ID.

- Parameters
    - keyName (string : a name of key to be removed)
- Return
    - void

```javascript
// Remove Rtoaster's ID from user.external_ids
atlasTracking.delCustomId('rtoaster');
```


## Other useful functions

### initEventListeners()

Re-initialize Event Listeners. If elements in the page changed since `initPage()`, you can reset all Event Listeners used in ATJ by calling this method.
However, most mechanism performing Event Listener in ATJ applies Event Delegation, so there is few needs to reset Event Listeners.

- Parameters
    - void
- Return
    - void

### getVisibility(htmlElement)

`getVisibility()` evaluates and returns information about visibility of the particular HTML element specified in the parameter.

- Parameters
    - htmlElement (element : a single HTML element to be evaluated)
- Return
    - result (map : a variety of information about visibility status described below)

|Path|Type|Meaning|Example|
|:----:|:----:|:----:|:----:|
|status.isInView|Boolean|The target element is partially/totally viewable or not|`true`|
|status.location|String|Rough description for visible part like all, top, bottom...|`all`|
|detail.documentHeight|Float|The height of document in pixel or point(iOS)|`4401`|
|detail.documentIsVisible|String|Visibility of the document. If the tab is active then `visible`, if the tab is background then `hidden`|`visible`|
|detail.documentScrollUntil|Float|The location of bottom side in visible area of window|`894`|
|detail.documentScrollRate|Float|The rate of scroll depth comparing between scrollUntil and documentHeight|`0.203135665`|
|detail.documentVisibleTop|Float|The location of top side of visible area for document|`735`|
|detail.documentVisibleBottom|Float|The location of bottom side of visible area for document|`894`|
|detail.targetHeight|Float|The height of target element in pixel or point(iOS)|`269`|
|detail.targetMarginTop|Float|Distance between the top of target element and the top of viewport|`455.03125`|
|detail.targetMarginBottom|Float|Distance between the bottom of target element and the bottom of viewport|`169.96875`|
|detail.targetScrollRate|Float|The rate of scroll depth of the target element. If 1, it means the element is visible from top until bottom|`1`|
|detail.targetScrollUntil|Float|The scroll depth on target element|`269`|
|detail.targetViewableRate|Float|Percentage of visible area of target element|`1`|
|detail.targetVisibleTop|Float|The location of top side of visible area for target element|`0`|
|detail.targetVisibleBottom|Float|The location of bottom side of visible area for target element|`269`|
|detail.viewportHeight|Float|The height of viewport|`894`|
