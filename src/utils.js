'use strict';

import Cookie from 'cookie';
import UUID from 'uuid/v4';

// SDK Version Info
const SDK_NAME = 'ATJ';
const SDK_VERSION = process.env.npm_package_version;
const SDK_API_KEY = process.env.SDK_API_KEY || 'test_api_key';
const DEFAULT_ENDPOINT = process.env.DEFAULT_ENDPOINT || 'atlas.local';

let atlasEndpoint = null;
let atlasApiKey = null;
let atlasBeaconTimeout = null;
let atlasCookieName = null;
let atlasCookieMaxAge = null;
let atlasCookieDomain = null;
let atlasId = '0';
let handlerEvents = {};
let handlerKey = 0;
let sendBeaconStatus = true;

/**
 * @ignore
 */
export default class Utils {
    constructor() {

    }

    initSystem(system) {
        const cookies = Cookie.parse(window.parent.document.cookie);
        let hostname = window.parent.location.hostname;
        let parsedHostname = hostname.split('.').reverse();

        atlasEndpoint = system.endpoint ? system.endpoint : DEFAULT_ENDPOINT;
        atlasApiKey = system.apiKey ? system.apiKey : SDK_API_KEY;
        atlasBeaconTimeout = system.beaconTimeout ? system.beaconTimeout : 2000;
        atlasCookieName = system.cookieName ? system.cookieName : 'atlasId';
        atlasCookieMaxAge = system.cookieMaxAge ? system.cookieMaxAge : (2 * 365 * 24 * 60 * 60);

        if (system.cookieDomain) {
            atlasCookieDomain = system.cookieDomain;
        } else {
            if (parsedHostname.length <= 2) {
                atlasCookieDomain = hostname;
            } else {
                if (parsedHostname[1].length > 2) {
                    atlasCookieDomain = parsedHostname[1] + '.' + parsedHostname[0];
                } else if (parsedHostname[0].length === 2 && parsedHostname[1].length === 2) {
                    atlasCookieDomain = parsedHostname[2] + '.' + parsedHostname[1] + '.' + parsedHostname[0];
                } else {
                    atlasCookieDomain = hostname;
                }
            }
        }

        atlasId = cookies[atlasCookieName];
        if (!atlasId || atlasId === '0' || atlasId === 0 || atlasId === '1' || atlasId === 1 || atlasId.length < 5) {
            atlasId = (UUID() + UUID()).replace(/-/g, '');
            window.parent.document.cookie = Cookie.serialize(atlasCookieName, atlasId, {
                maxAge: atlasCookieMaxAge,
                domain: atlasCookieDomain,
                path: '/'
            });
        }
    }

    setAtlasIdFromParam(k, d) {
        if (!atlasId && window.parent.document.referrer) {
            let r = window.parent.document.createElement('a');
            r.href = window.parent.document.referrer;
            if (d.indexOf(r.hostname) >= 0) {
                let p = this.getQ(k);
                if (p) {
                    atlasId = p;
                    window.parent.document.cookie = Cookie.serialize(atlasCookieName, atlasId, {
                        maxAge: atlasCookieMaxAge,
                        domain: atlasCookieDomain,
                        path: '/'
                    });
                }
            }
        }
    }

    qsM(s, t, d = null) {
        let e = null; // Trackable Element
        let c = 'button';
        let p = []; // Path
        if (t.nodeType === 3) {
            t = t.parentNode;
        }
        while (t && t !== window.parent.document) {
            let matches = (t.matches || t.msMatchesSelector || function () {return false;}).bind(t);
            if(!d){
                if(matches(s)){
                    return {
                        'element': t
                    };
                }
            }else{
                if(t.hasAttribute(d)){
                    p.unshift(t.getAttribute(d));
                }
                if (!e && matches(s)) {
                    if(t.tagName.toLowerCase() === 'a'){
                        c = 'link';
                    }
                    e = t;
                }
            }
            t = t.parentNode;
        }
        if(e && p.length > 0){
            return {
                'element': e,
                'category': c,
                'path': p.join('>')
            };
        }else{
            return false;
        }
    }

    getC(k) {
        const c = Cookie.parse(window.parent.document.cookie);
        if (c[k]) {
            return c[k];
        }
        return '';
    }

    getQ(k) {
        const s = window.parent.location.search.slice(1);
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

    getLS(k){
        let r = '';
        try {
            r = window.parent.localStorage[k];
        } catch(e) {
            r = '';
        }
        return r;
    }

    getP() {
        let p = {}; // Performance Timing
        let t = {}; // Navigation Type
        let r = {}; // Result
        if ('performance' in window.parent) {
            p = window.parent.performance.timing;
            r = {
                'unload': p.unloadEventEnd - p.unloadEventStart,
                'redirect': p.redirectEnd - p.redirectStart,
                'dns': p.domainLookupEnd - p.domainLookupStart,
                'tcp': p.connectEnd - p.connectStart,
                'request': p.responseStart - p.requestStart,
                'response': p.responseEnd - p.responseStart,
                'dom': (p.domContentLoadedEventStart - p.domLoading < 0 || p.domContentLoadedEventStart - p.domLoading > 3600000) ? null : p.domContentLoadedEventStart - p.domLoading,
                'domContent': (p.domContentLoadedEventEnd - p.domContentLoadedEventStart < 0 || p.domContentLoadedEventEnd - p.domContentLoadedEventStart > 3600000) ? null : p.domContentLoadedEventEnd - p.domContentLoadedEventStart,
                'onload': (p.loadEventEnd - p.loadEventStart < 0 || p.loadEventEnd - p.loadEventStart > 3600000) ? null : p.loadEventEnd - p.loadEventStart,
                'untilResponseComplete': (p.responseEnd - p.navigationStart < 0 || p.responseEnd - p.navigationStart > 3600000) ? null : p.responseEnd - p.navigationStart,
                'untilDomComplete': (p.domContentLoadedEventStart - p.navigationStart < 0 || p.domContentLoadedEventStart - p.navigationStart > 3600000) ? null : p.domContentLoadedEventStart - p.navigationStart
            };
            t = (window.parent.performance || {}).navigation;
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
            tgr = {};
        }

        const vph = window.parent.innerHeight; //viewportHeight
        const dch = window.parent.document.documentElement.scrollHeight; //documentHeight
        const div = window.parent.document.visibilityState || 'unknown'; //documentIsVisible
        const dvt = 'pageYOffset' in window.parent ?
            window.parent.pageYOffset :
            (window.parent.document.documentElement || window.parent.document.body.parentNode || window.parent.document.body).scrollTop; //documentVisibleTop
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

    buildIngest(u, c, s) {
        let igt = {}; //ingest
        let lyt = 'unknown'; //layout
        if (window.parent.orientation) {
            lyt = ((Math.abs(window.parent.orientation) === 90) ? 'landscape' : 'portrait');
        }
        igt = {
            'user': u,
            'context': {}
        };
        for (let i in c) {
            igt.context[i] = c[i];
        }
        for (let i in s) {
            igt.context[i] = s[i];
        }
        const currentTime = new Date();
        igt.user.timezone = currentTime.getTimezoneOffset() / 60 * -1;
        igt.user.timestamp = currentTime.toISOString();
        igt.user.viewport_height = window.parent.innerHeight;
        igt.user.viewport_width = window.parent.innerWidth;
        igt.user.screen_height = window.parent.screen.height;
        igt.user.screen_width = window.parent.screen.width;
        igt.user.layout = lyt;
        return igt;
    }

    buildLink(u, k) {
        let r = null;
        let t = null;
        if (atlasId) {
            r = new RegExp('(\\?|&)' + k + '=(.*?)(&|$)');
            t = u.search.replace(r, '');
            if (t.length > 0) {
                u.search = t + `&${k}=${atlasId}`;
            } else {
                u.search = `?${k}=${atlasId}`;
            }
        }
        return u.href;
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

    xhr(u, b, m, a) {
        let x = null;
        if (window.parent.XDomainRequest) {
            x = new XDomainRequest();
            x.ontimeout = function () {
            };
            x.onprogress = function () {
            };
            x.onerror = function () {
            };
        } else {
            x = new XMLHttpRequest();
        }

        x.open(m, u, a);
        if (a === true) {
            x.timeout = atlasBeaconTimeout;
        }
        x.withCredentials = true;

        if (m === 'GET') {
            x.send();
        } else {
            x.send(b);
        }

    }

    transmit(ac, ca, md, ur, ct, sp, ug, dg) {
        const protocol = (document.location && document.location.protocol === 'http:') ? 'http:' : 'https:'; //protocol
        const now = Date.now();
        const sync = (dg && dg.syncMode) ? '&sync=true' : '';
        const m = ug ? 'GET' : 'POST'; //method
        const a = (!(ac === 'unload' && ca === 'page')); //async
        const o = (this.getC('atlasOptout') === 'true') ? true : false;
        let f = 1; //fpcStatus
        if (this.getC(atlasCookieName) !== atlasId) {
            f = 0;
            atlasId = 0;
        }

        let u = `${protocol}//${atlasEndpoint}/${SDK_NAME}-${SDK_VERSION}/${now}/${encodeURIComponent(atlasId)}/${f}`
            + `/ingest?k=${atlasApiKey}${sync}&a=${ac}&c=${ca}`
            + `&g=${encodeURIComponent(md.url)}&r=${encodeURIComponent(md.referrer)}`
            + `&i=${encodeURIComponent(md.content_id)}&u=${encodeURIComponent(md.user_id)}`
            + '&aqe=%'; //endpointUrl

        let b = JSON.stringify(this.buildIngest(ur, ct, sp)); //body
        let eb = null; //encodedPayload

        if (ug) {
            eb = this.compress(encodeURIComponent(b));
            b = null;
            u = `${u}&d=${eb}`;
        }

        if (dg && dg.outputLog) {
            console.log({
                action: ac,
                category: ca,
                request: {
                    endpoint: u,
                    body: b
                },
                identity: {
                    atlasId: atlasId,
                    fpcStatus: f,
                    optout: o
                },
                variables: {
                    mandatories: md,
                    user: ur,
                    context: ct,
                    supplement: sp
                }
            });
        }

        if (!o) {
            if ('sendBeacon' in navigator && sendBeaconStatus === true) {
                try {
                    sendBeaconStatus = navigator.sendBeacon(u, b);
                } catch (e) {
                    sendBeaconStatus = false;
                }
                if (!sendBeaconStatus) {
                    this.xhr(u, b, m, a);
                }
                return true;
            } else {
                this.xhr(u, b, m, a);
                return true;
            }
        }
    }
}
