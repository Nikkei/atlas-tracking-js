# Atlas Tracking JS (ATJ)

Atlas tracking library for general web site

- ATJ is a tracking SDK for Atlas
- ATJ transmits beacons for general purpose of web analytics
- ATJ utilizes web-browser's modern features such as sendBeacon, requestAnimationFrame and Navigation Timing
- Some features uses Event Delegation mechanism
- A rich variety of auto tracking options available

## Documents

- [README in Japanese](./README-JP.md) is available. （[日本語の説明](./README-JP.md) はこちら）
- [Configuration Guide](./docs/CONFIGURATION.md) describes all customizable features managed through c2p.js.
- Some utility functions are available within ATJ core. You will find useful methods from a [List of Methods](./docs/METHODS.md)
- [FAQ](./docs/FAQ.md) is here but is still under enhancement.
- ATJ is published under [MIT License](./LICENSE.md)
- Special thanks to [all contributors](./docs/CONTRIBUTORS.md) in this project.
- As of today, we won't merge pull-requests from outside of Nikkei due to operational policy. Please create an issue on GitHub if you find any problems.

## Build ATJ

#### Create a build environment on Docker
```sh
docker build \
  --platform linux/x86_64 \
  --tag atj \
  ./

docker run \
  --platform linux/x86_64 \
  --name ATJ \
  --env SDK_API_KEY=your_sdk_api_key \
  --env DEFAULT_ENDPOINT=your.atlas.endpoint \
  --env SDK_NAMESPACE=atlasTracking \
  --volume  ${PWD##}:/var/atj \
  -it \
  atj
```

#### Environment Variables
|Variable|Purpose|Default|Example|
|:---:|:---:|:---:|:---:|
|SDK_API_KEY|For the authentication at Atlas Endpoint which is a destination to put data to|`test_api_key`|`abc123xyz789`|
|DEFAULT_ENDPOINT|A default endpoint. If you don't specify the endpoint in config variables in c2p.js, ATJ fall backs to the endpoint to this value|`atlas.local`|`atlas-endpoint.your.domain`|
|SDK_NAMESPACE|A namespace which will contains all methods and variables for ATJ, so ATJ consumes just one global namespace.|`atlasTracking`|`atlasTracking`|

#### Initialization
```sh
pnpm install
```

### Test
- You can lint the code by `pnpm run eslint`
- For the unit test, run `pnpm run test`

### Build
- For the standalone ATJ, `pnpm run build:dist` (In general, this will fit with most use cases)
- For generating NPM module, `pnpm run build:npm`

## Implementation Guide

### Requirements
- One variable in global namespace is required to store ATJ related variables and methods. You can specify the name for this when you build ATJ.
- ATJ uses one Cookie to identify unique browser. A Cookie name is defined in c2p.js but the default is `atlasId`
- ATJ dispatch a custom event named `atlasVisibilityStatus` to detect visibility status of each elements for Scroll Depth, Read Through and Viewable Impression. Dispatch frequency depends on the combination of `requestAnimationFrame` and throttling.
- ATJ supports many browsers as possible without polyfill, but it doesn't work with old Internet Explorer older than IE9

### Basic Installation
1. Build your ATJ by following [Readme](./README.md) and then you will have `atj.min.js` in `./dist` directory.
2. Create a config file named `c2p.js` based on a sample file in `./dist`  directory. Read [Config Guide](./docs/CONFIGURATION.md) carefully to customize ATJ.
3. Load both files `atj.min.js` and `c2p.js` within `<body>...</body>` on each page in your web site.
    - You can call these files by embedding `script` tags like `<script src='{path/to/file}'></script>` directly.
    - Also, you can deploy ATJ files through Tag Management tools such as Adobe Dynamic Tag Management, Google Tag Manager and other tag management tools.
4. Check your web site to confirm that there is no script errors and ATJ is sending beacons.

### Inside c2p.js
- c2p.js fires methods as below step:
    1. Configure ATJ core by calling `config()`
    2. Initialize the page data by calling `initPage()`
    3. Then, send a beacon for tracking pageview by `trackPage()`
- Also, c2p.js is able to have some custom codes to retrieve and/or prepare data.
- If your web site is SPA (Single Page Application), you can call `initPage()` and `trackPage()` each times when screen has been changed. (no need to re-initialize ATJ itself)

### Opt-out for Privacy
ATJ has a built-in method to add "opt-out from tracking" feature in your service. This is strongly recommended at any cases from the privacy perspective. It's necessary to consider the opt-out feature if your service is used from countries which is applied GDPR.

1. Create or modify your opt-out page or modal to add an "opt-out from tracking" button.
2. Write a few code to call `atlasTracking.optout('enable')` when user clicks the opt-out button.

- Opt-outed user can opt-in by `atlasTracking.optout('disable');`
- To protect user's privacy perfectly within ATJ, you should place the opt-out feature before sending the first beacon, thus `initPage()` and `trackPage()` must be triggered once user has accepted tracking.
