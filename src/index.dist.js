import AtlasTracking from './index.js';
const SDK_NAMESPACE = process.env.SDK_NAMESPACE || 'atlasTracking';
window[SDK_NAMESPACE] = new AtlasTracking();
