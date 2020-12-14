# Configuration Guide

## Library Level Configuration Parameters for config()

`config()` accepts one map object including configuration variables for ATJ.
Most variables except `system` can be omitted but strongly recommend to specify values explicitly.

### Basic structure

```javascript
{
    'system': {...},
    'defaults': {...},
    'product': {...},
    'options': {
        'useGet': true,
        'exchangeAtlasId': {...},
        'trackClick': {...},
        'trackLink': {...},
        'trackDownload': {...},
        'trackNavigation': {...},
        'trackPerformance': {...},
        'trackScroll': {...},
        'trackInfinityScroll': {...},
        'trackRead': {...},
        'trackViewability': {...},
        'trackMedia': {...},
        'trackForm': {...},
        'trackUnload': {...}
    }
}
```

### Variables

#### system

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|endpoint|String|Destination which ATJ transmit beacons to|`atlas-endpoint.your.domain`|
|apiKey|String|Atlas Endpoint will accept beacons having this key|`abc123xyz789`|
|beaconTimeout|Integer|Time limit in milli sec to cancel the connection to the endpoint |`2000` (2 sec)|
|cookieName|String|Cookie name to store Atlas ID|`atlasId`|
|cookieMaxAge|Integer|Atlas ID Cookie lifetime|`(2 * 365 * 24 * 60 * 60)` (2 years)|
|cookieDomain|String|Domain to be used as domain-attribute when ATJ set Atlas ID Cookie|`your.domain`|

#### defaults

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|pageUrl|String|Page URL where pageview and other events occurred at|`window.parent.document.location.href`|
|pageReferrer|String|Referring URL = a previous page URL|`window.parent.document.referrer`|
|pageTitle|String|Page title|`window.parent.document.title`|

- Page title is friendly to identify the page but it requires you to set the different page title to each page.

#### product

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|productFamily|String|Product Family. If you have multiple UIs or applications to access your service, you can make these grouped by this value|`MyDigitalService`|
|productName|String|Product Name. If you have multiple services within the same brand, you can identify each service by this value|`MyDigitalService-Web`|

- You can set the same value to both variable if you have only one product under the brand.

#### useGet (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|useGet|Boolean|Switch the method to send beacons. `true` = GET, `false` = POST|`true`|

- Some Japan specific proxy based security software removes a POST body but retain Content-Length header in the request. So, GET is safer ways to prevent data destruction caused by the security tool.

#### exchangeAtlasId (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|exchangeAtlasId.pass|Boolean|Use this feature or not|`true`|
|exchangeAtlasId.passParamKey|String|Name of GET parameter to set Atlas ID into|`atlas_id`|
|exchangeAtlasId.passTargetDomains|Array|Array of domains to pass Atlas ID|`['domain1','domain2','domain3']`|
|exchangeAtlasId.catch|Boolean|Use this feature or not|`true`|
|exchangeAtlasId.catchParamKey|String|Name of GET parameter to receive Atlas ID from|`atlas_id`|
|exchangeAtlasId.catchTargetDomains|Array|Array of domains to receive Atlas ID|`['domain1','domain2','domain3']`|

- ATJ can share Atlas ID across multiple domains without third party cookie and it uses GET parameter to exchange Atlas ID.
- `pass` side is a feature to hand-over Atlas ID to external domains listed in `passTargetDomains`
- `catch` side is a feature to receive Atlas ID passed from external domains listed in `catchTargetDomains`

#### trackClick (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackClick.enable|Boolean|Use this feature or not|`true`|
|trackClick.targetAttribute|String|ATJ collects data when user clicked elements which has this data attribution |`data-atlas-trackable`|
                    
#### trackLink (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackLink.enable|Boolean|Use this feature or not|`true`|
|trackLink.internalDomains|Array|Array of domains you want to exclude from the exit link clicks|`['domain1','domain2','domain3']`|
|trackLink.nameAttribute|String|You can set a custom name for the link by adding data attribution and specify the attribution name here|`data-atlas-link-name`|

#### trackDownload (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackDownload.enable|Boolean|Use this feature or not|`true`|
|trackDownload.fileExtensions|Array|Array of file extensions you want to track downloads|`['pdf','zip','tar','gz']`|
|trackDownload.nameAttribute|String|You can set an alternative name for the file by adding data attribution and specify the attribution name here|`data-atlas-link-name`|                    
#### trackNavigation (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackNavigation.enable|Boolean|Use this feature or not|`true`|


#### trackPerformance (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackPerformance.enable|Boolean|Use this feature or not|`true`|

- Track Performance helps you to monitor real-user performance information but the data object is little bit large.
- If you want to measure Sec until onload, you may need to call `trackAction()` on the onload event due to load sequence.

#### trackScroll (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackScroll.enable|Boolean|Use this feature or not|`true`|
|trackScroll.granularity|Integer|ATJ sends beacons when the scroll depth is changed more than N percent specified here (1-99)|`20`|
|trackScroll.threshold|Integer|ATJ sends beacons if user keeps the scroll depth for over T sec defined here|`2`|

- Scroll Depth is measured by the combination of both `granularity` and `threshold`. So, if user scroll-down to 90% but scroll-up to 10% within 1sec, ATJ doesn't send beacons.
- Scroll Depth tracking only observes scroll behavior to the bottom side.
- If your web site uses infinity scroll / lazy load, the standard scroll depth tracking doesn't fit. So, use `trackInfinityScroll` instead of `trackScroll`.

#### trackInfinityScroll (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackInfinityScroll.enable|Boolean|Use this feature or not|`true`|
|trackInfinityScroll.step|Integer|If the scroll depth is changed more than N pixels/points specified here, ATJ sends beacons|`600`|
|trackInfinityScroll.threshold|Integer|ATJ sends beacons if user keeps the scroll depth for over T sec defined here|`2`|

#### trackRead (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackRead.enable|Boolean|Use this feature or not|`true`|
|trackRead.target|Element|Target element to be observed|`document.getElementById('article_body')`|
|trackRead.granularity|Integer|ATJ sends beacons when the read-through rate is changed more than N percent specified here (1-99)|`25`|
|trackRead.milestones|Array|ATJ also sends beacons when time elapsed more than these milestones|`[4, 15, 30, 60, 90, 120]`|

- A difference between `trackScroll` and `trackRead` is:
    - `trackScroll` measures scroll depth of window
    - `trackRead` only focuses on visibility change on block element of content body
- `trackScroll` works based on the combination of depth and time but `trackRead` uses depth and time separately.

#### trackViewability (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackViewability.enable|Boolean|Use this feature or not|`true`|
|trackViewability.targets|Array|Array of HTML elements to be observed|`document.getElementsByClassName('ad_frame')`|

- IAB's definition for Viewable Impression is applied but ATJ doesn't measure the exact seconds due to performance perspective (throttled every 250ms)

#### trackMedia (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackMedia.enable|Boolean|Use this feature or not|`true`|
|trackMedia.selector|String|A query selector string to detect elements to be observed|`video, audio`|
|trackMedia.heartbeat|Integer|When user playing media, ATJ sends "heartbeat" beacons every N seconds specified here|`5`|

#### trackForm (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackForm.enable|Boolean|Use this feature or not|`true`|
|trackForm.target|Element|Pass the parent element which contains form elements to be tracked status|`document.getElementById('form_element')`|

- This feature is still experimental.

#### trackUnload (under options)

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|trackUnload.enable|Boolean|Use this feature or not|`true`|

- ATJ can send a beacon when user is about to unload the page, but the accuracy depends on the connection performance to the endpoint, DNS and client. Sometime the request is killed by browser.

## Page Level Configuration Parameters for initPage()

`initPage()` accepts one map object including configuration variables for specific page.
Most variables can be omitted but it will be helpful for you if you set concrete values.

### Basic structure

```javascript
{
    user: {...},
    context: {...}
}
```

### Variables

#### user

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|user_id|String|User ID recognized by service side|`abc123`|
|user_status|String|User status like Login Status, Permission or Payment Plan|`loggedin`|
|site_session|String|Session ID handled by service side. If you want to combine Atlas data and server logs, this can be used as a key|`ce6b2f45-5362-4aec-a1e0-e93474f6d898`|
|external_ids|Map|Additional user IDs to integrate Atlas data and other systems|`{thirdparty_tool: '987xyz'}`|

- `user` is to store user side information such as user ID and environment.
- Atlas Endpoint has built-in session management so `site_session` is not necessary to handle sessions.
- `external_ids` can be managed by `setCustomId()` and `delCustomId()` after `initPage()`
                		
#### context

|Variable|Type|Purpose|Example|
|:----:|:----:|:----:|:----:|
|app|String|Name of application or micro-service responsible for the current page|`Hub`|
|app_version|String|Version of application or micro-service. Related to `app` var|`2.1.3`|
|source|String|Where content provided from|`Nikkei`|
|edition|String|Edition of content|`Online`|
|content_id|String|Unique value for identifying specific content|`abc123`|
|content_name|String|Title of content|`Nikkei made Atlas public as an opensource software`|
|content_status|String|If your service has a paywall or a meter system, you can set the status of content visibility here|`open`|
|page_name|String|Pagename for the page but not content name|`article`|
|page_num|Integer|Pagenation|`atlasTracking.getQueryValue('page') `|| 1`|
|category_l1|String|Category name. L1 is for large group of content|`Shoes`|
|category_l2|String|Category name. L2 is for medium size group of content|`Casual Shoes`|
|category_l3|String|Category name. L3 is for small group of content|`Sneakers`|
|tracking_code|String|Variable for AA compatible tracking code|`atlasTracking.getQueryValue('cid')`|
|events|String|You can specify an event on the page such as `purchase`, `submit` or `complete`...|`purchase`|
|campaign.name|String|Variable for GA compatible tracking parameters|`atlasTracking.getQueryValue('utm_campaign')`|
|campaign.source|String|Variable for GA compatible tracking parameters|`atlasTracking.getQueryValue('utm_source')`|
|campaign.medium|String|Variable for GA compatible tracking parameters|`atlasTracking.getQueryValue('utm_medium')`|
|campaign.term|String|Variable for GA compatible tracking parameters|`atlasTracking.getQueryValue('utm_term')`|
|campaign.content|String|Variable for GA compatible tracking parameters|`atlasTracking.getQueryValue('utm_content')`|
|search.term|String|Keyword which is searched in site search|`atlasTracking.getQueryValue('keyword')`|
|search.options|Map|Search options applied to site search|`{Region:'Asia',Limit:20}`|
|search.results|Integer|Number of result of site search|`document.getElementsByClassName('result-item').length`|
|funnel.funnel_name|String|Name of thr form|`Subscription`|
|funnel.funnel_steps|Integer|Total steps in the form|`4`|
|funnel.step_name|String|Current step of the form in user friendly name|`Confirmation`|
|funnel.step_number|Integer|Current step of the form in number|`3`|
|funnel.step_state|String|State of current step. For example, if user filled wrong value into the form, the confirmation process failed and the value must be 'failed'|`success`|
|funnel.products|Map|(experimental)|`{}`|
|flags|Map|Custom data object especially for flag data of service or user|`{ab_test_target:true}`|
|custom_object|Map|Custom data object other than pre-defined variables|`{foo:'bar'}`|

- `context` is to store contents or server side information such as content name, category of content, campaign and conversion related things.
- `custom_object` can be managed by `setCustomObject()` and `delCustomObject()` after `initPage()`
- You can add/delete variables just under `context` by using `setCustomVars()` and `delCustomVars()`
