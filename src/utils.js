'use strict';

// SDK Version Info
const SDK_VERSION = process.env.npm_package_version;
const SDK_API_KEY = process.env.SDK_API_KEY || 'test_api_key';
const DEFAULT_ENDPOINT = process.env.DEFAULT_ENDPOINT || 'atlas.local';

// Nginx URL Length default Limit
// See: http://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers
const MAX_REQUEST_URL_LENGTH = 8 * (1 << 10)

const HTTP_METHOD_GET = 'GET'
const HTTP_METHOD_POST = 'POST'
const HTTP_HEADER_CONTENT_TYPE = 'Content-Type'
const HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON = 'application/json'

const sdkName = 'ATJ';
const atlasCookieName = 'atlasId';

let atlasEndpoint = null;
let atlasApiKey = null;
let atlasBeaconTimeout = null;
let atlasId = '0';
let handlerEvents = {};
let handlerKey = 0;
let sendBeaconStatus = true;

/**
 * @ignore
 */
export default class Utils {
    constructor(targetWindow) {
        const timestamp = (+new Date()).toString(16);
        let result = '';
        if (self.crypto && self.crypto.getRandomValues) {
            const u32a = new Uint32Array(3);
            self.crypto.getRandomValues(u32a);
            for (const num of u32a) {
                result += num.toString(32);
            }
        }else{
            // For IE compatibility
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 32; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        this.uniqueId = `${timestamp}.${result}`;
        this.targetWindow = targetWindow;
    }

    initSystem(system) {
        atlasEndpoint = system.endpoint ? system.endpoint : DEFAULT_ENDPOINT;
        atlasApiKey = system.apiKey ? system.apiKey : SDK_API_KEY;
        atlasBeaconTimeout = system.beaconTimeout ? system.beaconTimeout : 2000;

        atlasId = this.getC(atlasCookieName);

        if (!atlasId || atlasId === '0' || atlasId === 0 || atlasId === '1' || atlasId === 1 || atlasId.length < 5) {
            atlasId =  this.uniqueId;
        }
    }

    qsM(s, t, d = false) {
        let e = null; // Trackable Element
        let c = 'button';
        let pt = []; // Path of data-trackable
        let pd = []; // Path of elements
        if (t.nodeType === 3) {
            t = t.parentNode;
        }
        while (t && t !== this.targetWindow.document) {
            let matches = (
                t.matches ||
                t.msMatchesSelector ||
                function () {
                    return false;
                }
            ).bind(t);

            let elm = t.tagName.toLowerCase();
            if (elm !== 'html' && elm !== 'body') {
                if (t.id) {
                    elm += `#${t.id}`;
                }
                if (t.className) {
                    elm += `.${t.className}`;
                }
                pd.unshift(elm);
            }

            if (d) {
                if (t.hasAttribute(d)) {
                    pt.unshift(t.getAttribute(d));
                }
            } 

            if (!e && matches(s)) {
                if (t.tagName.toLowerCase() === 'a') {
                    c = 'link';
                } else {
                    c = t.tagName.toLowerCase();
                }
                e = t;
            }

            t = t.parentNode;
        }

        return {
            'element': e,
            'category': c,
            'pathTrackable': pt.join('>'),
            'pathDom': pd.join('>')
        };

    }

    getAttr(attributeName, element) {
        let result = null;
        if(attributeName){
            result = element.getAttribute(attributeName);
        }
        if(result === null) {
            result = undefined;
        }
        return result;
    }

    getC(k) {
        const cookies = this.targetWindow.document.cookie.split(';');
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(`${k}=`) === 0) {
                return cookie.substring(`${k}=`.length, cookie.length);
            }
        }
        return '';
    }

    getQ(k) {
        const s = this.targetWindow.location.search.slice(1);
        if (s === '') {
            return '';
        }
        const q = s.split('&');
        const l = q.length;
        for (let i = 0; i < l; ++i) {
            const pair = q[i].split('=');
            if (decodeURIComponent(pair[0]) === k) {
                return decodeURIComponent(pair[1]);
            }
        }
        return '';
    }

    getLS(k) {
        let r = '';
        try {
            r = this.targetWindow.localStorage[k];
        } catch (e) {
            // Nothing to do...
        }
        return r;
    }

    getNav() {
        let nav = {
            history_length: this.targetWindow.history.length
        };
        if ('performance' in this.targetWindow) {
            let p = this.targetWindow.performance;
            if ('getEntriesByType' in p) {
                let navs = p.getEntriesByType('navigation');
                if(navs.length >= 1) {
                    nav.type = navs[0].type;
                    nav.redirectCount = navs[0].redirectCount;
                    nav.domContentLoaded = navs[0].domContentLoadedEventStart;
                }
            }
            if ('getEntriesByName' in p) {
                let paints = p.getEntriesByName('first-paint');
                if(paints.length >= 1) {
                    nav.first_paint = paints[0].startTime;
                }
            }
        }
        return nav;
    }

    getP() {
        const tsDiff = function(tsStart, tsEnd){
            return (tsEnd - tsStart < 0 || tsEnd - tsStart > 3600000) ? undefined :  Math.round(tsEnd - tsStart);
        };
        let p = {}; // Performance Timing
        let t = {}; // Navigation Type
        let r = {}; // Result
        if ('performance' in this.targetWindow) {
            p = this.targetWindow.performance.timing;
            r = {
                'unload': tsDiff(p.unloadEventStart, p.unloadEventEnd),
                'redirect': tsDiff(p.redirectStart, p.redirectEnd),
                'dns': tsDiff(p.domainLookupStart, p.domainLookupEnd),
                'tcp': tsDiff(p.connectStart, p.connectEnd),
                'request': tsDiff(p.requestStart, p.responseStart),
                'response': tsDiff(p.responseStart, p.responseEnd),
                'dom': tsDiff(p.domLoading, p.domContentLoadedEventStart),
                'domContent': tsDiff(p.domContentLoadedEventStart, p.domContentLoadedEventEnd),
                'onload': tsDiff(p.loadEventStart, p.loadEventEnd),
                'untilResponseComplete': tsDiff(p.navigationStart, p.responseEnd),
                'untilDomComplete': tsDiff(p.navigationStart, p.domContentLoadedEventStart)
            };
            t = (this.targetWindow.performance || {}).navigation;
        }
        return {
            'performanceResult': r,
            'navigationType': t
        };
    }

    handler() {
        return {
            add: function (target, type, listener, capture) {
                target.addEventListener(type, listener, capture);
                handlerEvents[handlerKey] = {
                    target: target,
                    type: type,
                    listener: listener,
                    capture: capture
                };
                return handlerKey++;
            },
            remove: function (handlerKey) {
                if (handlerKey in handlerEvents) {
                    let e = handlerEvents[handlerKey];
                    e.target.removeEventListener(e.type, e.listener, e.capture);
                }
            }
        };
    }

    getV(t) {
        let tgr = {}; //targetRect
        try {
            tgr = t.getBoundingClientRect();
        } catch (e) {
            // Nothing to do...
        }

        const vph = this.targetWindow.innerHeight; //viewportHeight
        const dch = this.targetWindow.document.documentElement.scrollHeight; //documentHeight
        const div = this.targetWindow.document.visibilityState || 'unknown'; //documentIsVisible
        const dvt = 'pageYOffset' in this.targetWindow ?
            this.targetWindow.pageYOffset :
            (this.targetWindow.document.documentElement || this.targetWindow.document.body.parentNode || this.targetWindow.document.body).scrollTop; //documentVisibleTop
        const dvb = dvt + vph; //documentVisibleBottom
        const tgh = tgr.height; //targetHeight
        const tmt = tgr.top <= 0 ? 0 : tgr.top; //targetMarginTop
        const tmb = (tgr.bottom - vph) * -1 <= 0 ? 0 : (tgr.bottom - vph) * -1; //targetMarginBottom
        const dsu = dvb; //documentScrollUntil
        const dsr = dvb / dch; //documentScrollRate

        let tvt = null; //targetVisibleTop
        let tvb = null; //targetVisibleBottom
        let tsu = 0; //targetScrollUntil
        let tsr = 0; //targetScrollRate
        let tvr = 0; //targetViewableRate
        let iiv = false; //isInView
        let loc = null; //location

        if (tgr.top >= 0 && tgr.bottom > vph && tgr.top >= vph) {
            // pre
            tvt = null;
            tvb = null;
            iiv = false;
            loc = 'pre';
        } else if (tgr.top >= 0 && tgr.bottom > vph && tgr.top < vph) {
            // top
            tvt = 0;
            tvb = vph - tgr.top;
            iiv = true;
            loc = 'top';
        } else if (tgr.top < 0 && tgr.bottom > vph) {
            // middle
            tvt = tgr.top * -1;
            tvb = tvt + vph;
            iiv = true;
            loc = 'middle';
        } else if (tgr.top >= 0 && tgr.bottom <= vph) {
            // all in
            tvt = 0;
            tvb = tgh;
            iiv = true;
            loc = 'all';
        } else if (tgr.top < 0 && tgr.bottom >= 0 && tgr.bottom <= vph) {
            // bottom
            tvt = tgh + tgr.top;
            tvb = tgh;
            iiv = true;
            loc = 'bottom';
        } else if (tgr.top < 0 && tgr.bottom < 0) {
            // post
            tvt = null;
            tvb = null;
            iiv = false;
            loc = 'post';
        } else {
            iiv = false;
            loc = 'unknown';
        }

        tvr = (tvb - tvt) / tgh;
        tsu = tvb;
        tsr = tsu / tgh;

        return {
            'detail': {
                'viewportHeight': vph,
                'documentHeight': dch,
                'documentIsVisible': div,
                'documentVisibleTop': dvt,
                'documentVisibleBottom': dvb,
                'targetHeight': tgh,
                'targetVisibleTop': tvt,
                'targetVisibleBottom': tvb,
                'targetMarginTop': tmt,
                'targetMarginBottom': tmb,
                'targetScrollUntil': tsu,
                'targetScrollRate': tsr,
                'targetViewableRate': tvr,
                'documentScrollUntil': dsu,
                'documentScrollRate': dsr
            },
            'status': {
                'isInView': iiv,
                'location': loc
            }
        };
    }

    getM(t) {
        if (t !== void 0) {
            return {
                'tag': t.nodeName.toLowerCase() || 'na',
                'id': t.id || 'na',
                'src': t.src || 'na',
                'type': t.type || undefined,
                'codecs': t.codecs || undefined,
                'muted': t.muted || false,
                'default_muted': t.defaultMuted || false,
                'autoplay': t.autoplay || false,
                'width': t.clientWidth || undefined,
                'height': t.clientHeight || undefined,
                'player_id': t.playerId || undefined,
                'played_percent': Math.round(t.currentTime / t.duration * 100),
                'duration': t.duration,
                'current_time': Math.round(t.currentTime * 10) / 10,
                'dataset': t.dataset
            };
        }
    }

    getF(f, e, t, pl) {
        const n = t.name || t.id || '-';
        let l = 0;
        if (t.tagName.toLowerCase() === 'select') {
            let a = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].selected) {
                    a.push(true);
                }
            }
            l = a.length;
        } else if (t.tagName.toLowerCase() === 'input' && (t.type === 'checkbox' || t.type === 'radio')) {
            if (t.checked) {
                l = 1;
            } else {
                l = 0;
            }
        } else {
            l = t.value.length;
        }
        if (t.type !== 'hidden') {
            f.items_detail[n] = {
                'status': e,
                'length': l
            };
        }
        if (!f.first_item) {
            f.first_item = t.name || t.id || '-';
            f.first_item_since_page_load = (Date.now() - pl) / 1000;
        }
        f.last_item = t.name || t.id || '-';
        f.last_item_since_page_load = (Date.now() - pl) / 1000;
        f.last_item_since_first_item = f.last_item_since_page_load - f.first_item_since_page_load;
        return f;
    }

    getUniqueId() {
        return  this.uniqueId;
    }

    buildIngest(u, c, s) {
        let igt = {
            'user': u,
            'context': {}
        }; //ingest
        let lyt = 'unknown'; //layout
        if (this.targetWindow.orientation) {
            lyt = ((Math.abs(this.targetWindow.orientation) === 90) ? 'landscape' : 'portrait');
        }

        for (let i in c) {
            igt.context[i] = c[i];
        }
        for (let i in s) {
            igt.context[i] = s[i];
        }
        const currentTime = new Date();
        igt.user.timezone = currentTime.getTimezoneOffset() / 60 * -1;
        igt.user.timestamp = currentTime.toISOString();
        igt.user.viewport_height = this.targetWindow.innerHeight;
        igt.user.viewport_width = this.targetWindow.innerWidth;
        igt.user.screen_height = this.targetWindow.screen.height;
        igt.user.screen_width = this.targetWindow.screen.width;
        igt.user.layout = lyt;
        return igt;
    }

    compress(v) {
        let r = v;
        r = r.replace(/%22%7D%2C%22/g, '%z');
        r = r.replace(/%22%3A%22/g, '%y');
        r = r.replace(/%22%2C%22/g, '%x');
        r = r.replace(/%22%3A%7B/g, '%w');
        r = r.replace(/%22%3A/g, '%v');
        r = r.replace(/%2C%22/g, '%u');
        r = r.replace(/%7D%7D%7D/g, '%t');
        return r;
    }

    xhr(u, a, m, b) {
        const x = new XMLHttpRequest();
        x.open(m, u, a);
        if (a === true) {
            x.timeout = atlasBeaconTimeout;
        }
        x.withCredentials = true;

        try{
            if (m === HTTP_METHOD_POST && b) {
                x.setRequestHeader(HTTP_HEADER_CONTENT_TYPE, HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON)
                x.send(new Blob([b], { type: HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON }))
            } else {
                x.send();
            }
        }catch(e){
            // Nothing to do...
        }
    }

    transmit(ac, ca, ur, ct, sp) {
        const now = Date.now();
        const a = (!(ac === 'unload' && ca === 'page')); //async
        let f = 1; //fpcStatus
        if (this.getC(atlasCookieName) !== atlasId) {
            f = 0;
        }

        const b = JSON.stringify(this.buildIngest(ur, ct, sp));
        const _u = `https://${atlasEndpoint}/${sdkName}-${SDK_VERSION}/${now}/${encodeURIComponent(atlasId)}/${f}`
            + `/ingest?k=${atlasApiKey}&a=${ac}&c=${ca}&aqe=%`; //endpointUrl

        let u = _u + `&d=${this.compress(encodeURIComponent(b))}`;
        let m = HTTP_METHOD_GET;

        // Calculates the number of bytes in the URL string length
        // and switches to POST if it is greater than MAX_REQUEST_URL_LENGTH
        if (u.replace(/%../g, '*').length > MAX_REQUEST_URL_LENGTH) {
            m = HTTP_METHOD_POST;
            u = _u;
        }

        if ('sendBeacon' in navigator && sendBeaconStatus === true) {
            try {
                let blob = null;
                if (m == HTTP_METHOD_POST && b) {
                    blob = new Blob([b], { type: HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON })
                }

                sendBeaconStatus = navigator.sendBeacon(u, blob);
            } catch (e) {
                sendBeaconStatus = false;
            }
            if (!sendBeaconStatus) {
                this.xhr(u, a, m, b);
            }
            return true;
        } else {
            const targetWindow = this.targetWindow;
            if (('fetch' in targetWindow && typeof targetWindow.fetch === 'function')
                && ('AbortController' in targetWindow && typeof targetWindow.AbortController === 'function')) {
                const controller = new targetWindow.AbortController();
                const signal = controller.signal;
                setTimeout(() => controller.abort(), atlasBeaconTimeout);
                try{
                    const options = { signal, method: m, cache: 'no-store', keepalive: true };
                    if (m === HTTP_METHOD_POST && b) {
                        options['body'] = new Blob([b], { type: HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON });
                        options['headers'] = {}
                        options['headers'][HTTP_HEADER_CONTENT_TYPE] = HTTP_HEADER_CONTENT_TYPE_APPLICATION_JSON;
                    }

                    this.targetWindow.fetch(u, options);
                }catch(e){
                    // Nothing to do...
                }
            } else {
                this.xhr(u, a, m, b);
            }
            return true;
        }
    }

    setSendBeaconStatusForTestUse(st) {
        sendBeaconStatus = !!st;
    }
}
