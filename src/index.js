'use strict';

import Utils from './utils.js';

let system = {};
let options = {};
let user = {};
let context = {};
let dataSrc = {};
let defaults = {};
let supplement = {};
let performanceInfo = {};
let atlasDOMContentLoadedHandler = null;
let targetWindow = window['parent'];
let visibilityEvent = null;
let unloadEvent = null;
let eventHandlerKeys = {
    unload: null,
    scroll: null,
    infinityScroll: null,
    read: null,
    click: null,
    viewability: {},
    media: {},
    form: {}
};

let pageLoadedAt = Date.now();
let prevActionOccurredAt = pageLoadedAt;


export default class AtlasTracking {
    constructor() {

    }

    /**
     * get current url's query value associated with argument.
     * @param  {string} k key of the query parameters.
     * @return {string}   value associated with the key.
     */
    getQueryValue(k) {
        return this.utils.getQ(k) || '';
    }

    /**
     * get current cookie value associated with argument.
     * @param  {string} k key of the cookie value.
     * @return {string}   value associated with the key.
     */
    getCookieValue(k) {
        return this.utils.getC(k) || '';
    }


    /**
     * get current localStorage value associated with argument.
     * @param  {string} k key of the localStorage index key.
     * @return {string}   value associated with the key.
     */
    getLocalStorageValue(k) {
        return this.utils.getLS(k) || '';
    }

    /**
     * store stringified JSON.
     * @param {string} s stringified JSON string.
     */
    setDataSrc(s) {
        dataSrc = JSON.parse(decodeURIComponent(s));
    }

    /**
     * get value from Object stored by `setDataSrc`.
     * @param  {string} d key to fetch data.
     * @return {string|number|Object|Array|Boolean} fetched data.
     */
    getDataFromSrc(d) {
        return dataSrc[d] || '';
    }

    /**
     * Inspect the element's visibility
     * @param  {HTMLElement} t element to be inspected.
     * @return {Object} inspection result.
     */
    getVisibility(t) {
        return this.utils.getV(t) || '';
    }

    /**
     * configure atlas tracking.
     * @param  {Object} obj configuration object.
     */
    config(obj) {

        system = obj.system !== void 0 ? obj.system : {};
        targetWindow = system.targetWindow ? window[system.targetWindow] : window['parent'];
        defaults.url = obj.defaults.pageUrl !== void 0 ? obj.defaults.pageUrl : targetWindow.document.location.href;
        defaults.referrer = obj.defaults.pageReferrer !== void 0 ? obj.defaults.pageReferrer : targetWindow.document.referrer;
        defaults.page_title = obj.defaults.pageTitle !== void 0 ? obj.defaults.pageTitle : targetWindow.document.title;
        defaults.product_family = obj.product.productFamily !== void 0 ? obj.product.productFamily : null;
        defaults.product = obj.product.productName !== void 0 ? obj.product.productName : null;

        this.utils = new Utils(targetWindow);
        this.eventHandler = new this.utils.handler;

        if ('onbeforeunload' in targetWindow) {
            unloadEvent = 'beforeunload';
        } else if ('onpagehide' in targetWindow) {
            unloadEvent = 'pagehide';
        } else {
            unloadEvent = 'unload';
        }

        try {
            visibilityEvent = new CustomEvent('atlasVisibilityStatus');
        } catch (e) {
            visibilityEvent = targetWindow.document.createEvent('CustomEvent');
            visibilityEvent.initCustomEvent('atlasVisibilityStatus', false, false, {});
        }
        let requestAnimationFrame = targetWindow.requestAnimationFrame || targetWindow.mozRequestAnimationFrame || targetWindow.webkitRequestAnimationFrame || targetWindow.msRequestAnimationFrame;

        if (requestAnimationFrame) {
            targetWindow.requestAnimationFrame = requestAnimationFrame;
        } else {
            let lastTime = 0;
            targetWindow.requestAnimationFrame = function (callback) {
                let currTime = Date.now();
                let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                let id = targetWindow.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        let timerFrequency = null;
        (function visibilityWatcher() {
            targetWindow.requestAnimationFrame(visibilityWatcher);
            if (timerFrequency) {
                return false;
            }
            timerFrequency = setTimeout(function () {
                targetWindow.dispatchEvent(visibilityEvent);
                timerFrequency = null;
            }, 250);
        })();

        options = obj.options !== void 0 ? obj.options : {};
        this.utils.initSystem(system);
    }

    /**
     * set custom variable.
     * @param {string} k                     key of the variable.
     * @param {Object|string|number\Array|Boolean} o variable to be set.
     */
    setCustomVars(k, o) {
        context[k] = o;
    }

    /**
     * set custom object in ingest.context.custom_object
     * @param {string} k key of the object.
     * @param {Object} o object to be set.
     */
    setCustomObject(k, o) {
        context.custom_object[k] = o;
    }

    /**
     * set user id of external tools(e.g. rtoaster).
     * @param {string} k key of the user id.
     * @param {string} o user id to be set.
     */
    setCustomId(k, o) {
        user.external_ids[k] = o;
    }

    /**
     * delete custome variable set by `setCustomVars`.
     * @param  {string} k key of the variable.
     */
    delCustomVars(k) {
        delete context[k];
    }

    /**
     * delete custom object set by `setCustomObject`.
     * @param  {string} k key of the custom object.
     */
    delCustomObject(k) {
        delete context.custom_object[k];
    }

    /**
     * delete custom user id set by `setCustomId`.
     * @param  {string} k key of the object.
     */
    delCustomId(k) {
        delete user.external_ids[k];
    }

    /**
     * re-attach event listeners to DOMs.
     */
    initEventListeners() {
        if ((options.exchangeAtlasId && options.exchangeAtlasId.pass) || (options.trackClick && options.trackClick.enable) || (options.trackLink && options.trackLink.enable) || (options.trackDownload && options.trackDownload.enable)) {
            this.delegateClickEvents({
                'trackClick': options.trackClick,
                'trackLink': options.trackLink,
                'trackDownload': options.trackDownload
            });
        }
        if (options.trackUnload && options.trackUnload.enable) {
            this.setEventToUnload();
        }
        if (options.trackScroll && options.trackScroll.enable) {
            this.trackScroll(options.trackScroll.granularity, options.trackScroll.threshold);
        }
        if (options.trackInfinityScroll && options.trackInfinityScroll.enable) {
            this.trackInfinityScroll(options.trackInfinityScroll.step, options.trackInfinityScroll.threshold);
        }
        if (options.trackRead && options.trackRead.enable) {
            this.trackRead(options.trackRead.target, options.trackRead.granularity, options.trackRead.milestones);
        }
        if (options.trackViewability && options.trackViewability.enable) {
            this.trackViewability(options.trackViewability.targets);
        }
        if (options.trackMedia && options.trackMedia.enable) {
            this.trackMedia(options.trackMedia.selector, options.trackMedia.heartbeat);
        }
        if (options.trackForm && options.trackForm.enable) {
            this.trackForm(options.trackForm.target);
        }
        if (options.trackPerformance && options.trackPerformance.enable) {
            atlasDOMContentLoadedHandler = () => {
                performanceInfo = this.utils.getP();
                context.navigation_timing = performanceInfo.performanceResult || {};
                context.navigation_type = performanceInfo.navigationType || {};
            };
            targetWindow.addEventListener('DOMContentLoaded', atlasDOMContentLoadedHandler, false);
        }
    }

    /**
     * initialize atlas tracking per page.
     * @param  {Object} obj initialization config object.
     */
    initPage(obj) {
        if (obj.user !== void 0) {
            user = {
                'user_id': obj.user.user_id || undefined,
                'user_status': obj.user.user_status || undefined,
                'site_session': obj.user.site_session || undefined,
                'external_ids': {},
                'custom_object': obj.user.custom_object || {},
                'federation_id': obj.user.federation_id || undefined
            };
        }
        if (obj.context !== void 0) {
            context = {
                'root_id': this.utils.generateRootId(),
                'url': obj.context.url !== void 0 ? obj.context.url : defaults.url,
                'referrer': obj.context.referrer !== void 0 ? obj.context.referrer : defaults.referrer,
                'product_family': obj.context.product_family !== void 0 ? obj.context.product_family : defaults.product_family,
                'product': obj.context.product || defaults.product,
                'app': obj.context.app || undefined,
                'app_version': obj.context.app_version || undefined,
                'page_title': obj.context.page_title || defaults.page_title,
                'source': obj.context.source || undefined,
                'edition': obj.context.edition || undefined,
                'content_id': obj.context.content_id || undefined,
                'content_name': obj.context.content_name || undefined,
                'content_status': obj.context.content_status || undefined,
                'page_name': obj.context.page_name || undefined,
                'page_num': obj.context.page_num || 1,
                'category_l1': obj.context.category_l1 || undefined,
                'category_l2': obj.context.category_l2 || undefined,
                'category_l3': obj.context.category_l3 || undefined,
                'tracking_code': obj.context.tracking_code || undefined,
                'campaign': obj.context.campaign || undefined,
                'search': obj.context.search || undefined,
                'events': obj.context.events || undefined,
                'custom_object': obj.context.custom_object || {},
                'funnel': obj.context.funnel || {},
                'visibility': targetWindow.document.visibilityState || 'unknown'
            };
        }
        if (options.trackNavigation && options.trackNavigation.enable) {
            context.navigation = this.utils.getNav() || {};
        }
        if (options.trackPerformance && options.trackPerformance.enable) {
            performanceInfo = this.utils.getP();
            context.navigation_timing = performanceInfo.performanceResult || {};
            context.navigation_type = performanceInfo.navigationType || {};
        }

        this.initEventListeners();
    }

    /**
     * remove tracking options and handlers
     */
    disableTracking() {
        if ((options.exchangeAtlasId && options.exchangeAtlasId.pass) || (options.trackClick && options.trackClick.enable) || (options.trackLink && options.trackLink.enable) || (options.trackDownload && options.trackDownload.enable)) {
            this.eventHandler.remove(eventHandlerKeys['click']);
        }
        if (options.trackUnload && options.trackUnload.enable) {
            this.eventHandler.remove(eventHandlerKeys['unload']);
        }
        if (options.trackScroll && options.trackScroll.enable) {
            this.eventHandler.remove(eventHandlerKeys['scroll']);
        }
        if (options.trackInfinityScroll && options.trackInfinityScroll.enable) {
            this.eventHandler.remove(eventHandlerKeys['infinityScroll']);
        }
        if (options.trackRead && options.trackRead.enable) {
            this.eventHandler.remove(eventHandlerKeys['read']);
        }
        if (options.trackViewability && options.trackViewability.enable) {
            this.eventHandler.remove(eventHandlerKeys['viewability']);
        }
        if (options.trackMedia && options.trackMedia.enable) {
            const targetEvents = ['play', 'pause', 'end'];
            for (const event of targetEvents) {
                this.eventHandler.remove(eventHandlerKeys['media'][event]);
            }
        }
        if (options.trackForm && options.trackForm.enable && options.trackForm.target !== null) {
            const targetEvents = ['focus', 'change'];
            for (const event of targetEvents) {
                this.eventHandler.remove(eventHandlerKeys['form'][event]);
            }
        }
        if (options.trackPerformance && options.trackPerformance.enable) {
            targetWindow.removeEventListener('DOMContentLoaded', atlasDOMContentLoadedHandler);
        }

        options = {};
    }

    /**
     * track page view.
     */
    trackPage() {
        this.utils.transmit('view', 'page', user, context, supplement);
    }

    /**
     * Send any data at any timing.
     * @param  {string} [action='action']    describes how user interact.
     * @param  {string} [category='unknown'] what the action parameter's subject.
     * @param  {string} [events=null]        describes what happened by the user's action.
     * @param  {Object} [obj={}]             custom variables.
     */
    trackAction(action = 'action', category = 'unknown', events = null, obj = {}) {
        const now = Date.now();
        context.events = events || null;
        this.utils.transmit(action, category, user, context, {
            'action': {
                'location': obj.location || undefined,
                'destination': obj.destination || undefined,
                'dataset': obj.dataset || undefined,
                'name': obj.action_name || undefined,
                'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                'elapsed_since_prev_action': (now - prevActionOccurredAt) / 1000,
                'content_id': obj.content_id || undefined,
                'content_name': obj.content_name || undefined,
                'custom_vars': obj.custom_vars || {}
            }
        });
        context.events = null;
        prevActionOccurredAt = now;
    }

    /**
     * @private
     */
    delegateClickEvents(obj) {
        this.eventHandler.remove(eventHandlerKeys['click']);
        eventHandlerKeys['click'] = this.eventHandler.add(targetWindow.document.body, 'click', (ev) => {
            const targetAttribute = obj.trackClick && obj.trackClick.targetAttribute ? obj.trackClick.targetAttribute : false;
            const linkElement = this.utils.qsM('a', ev.target);
            const trackableElement = this.utils.qsM('a, button, [role="button"]', ev.target, targetAttribute);
            let elm = null;
            let ext = null;

            if (linkElement) {
                elm = linkElement.element;
                ext = (elm.pathname || '').match(/.+\/.+?\.([a-z]+([?#;].*)?$)/);



                // Outbound
                if (obj.trackLink && obj.trackLink.enable && elm.hostname && targetWindow.location.hostname !== elm.hostname && obj.trackLink.internalDomains.indexOf(elm.hostname) < 0) {
                    this.utils.transmit('open', 'outbound_link', user, context, {
                        'link': {
                            'destination': elm.href || undefined,
                            'dataset': elm.dataset || undefined,
                            'target': elm.target || undefined,
                            'media': elm.media || undefined,
                            'type': elm.type || undefined,
                            'name': obj.trackLink.nameAttribute ? elm.getAttribute(obj.trackLink.nameAttribute) : undefined
                        }
                    });
                }

                // Download
                if (obj.trackDownload && obj.trackDownload.enable && elm.hostname && ext && obj.trackDownload.fileExtensions.indexOf(ext[1]) >= 0) {
                    this.utils.transmit('download', 'file', user, context, {
                        'download': {
                            'destination': elm.href || undefined,
                            'dataset': elm.dataset || undefined,
                            'target': elm.target || undefined,
                            'media': elm.media || undefined,
                            'type': elm.type || undefined,
                            'name': obj.trackLink.nameAttribute ? elm.getAttribute(obj.trackDownload.nameAttribute) : undefined
                        }
                    });
                }
            }

            if (trackableElement && obj.trackClick.enable) {
                elm = trackableElement.element;
                this.utils.transmit('click', trackableElement.category, user, context, {
                    'action': {
                        'name': elm.getAttribute(targetAttribute),
                        'location': trackableElement.path,
                        'destination': elm.href || undefined,
                        'tag': elm.tagName.toLowerCase(),
                        'id': elm.id || undefined,
                        'class': elm.className || undefined,
                        'text': (elm.innerText || elm.value || '').substr(0,63) || undefined,
                        'target': elm.target || undefined,
                        'dataset': elm.dataset || undefined
                    }
                });
            }
        }, false);
    }

    /**
     * @private
     */
    setEventToUnload() {
        this.eventHandler.remove(eventHandlerKeys['unload']);
        eventHandlerKeys['unload'] = this.eventHandler.add(targetWindow, unloadEvent, () => {
            this.utils.transmit('unload', 'page', user, context, {
                'action': {
                    'name': 'leave_from_page',
                    'elapsed_since_page_load': ((Date.now()) - pageLoadedAt) / 1000
                }
            });
        }, false);
    }

    /**
     * @private
     */
    trackScroll(granularity, threshold) {
        const each = granularity || 25;
        const steps = 100 / each;
        const limit = threshold * 1000 || 2 * 1000;
        let now = Date.now();
        let prev = now;
        let r = {}; //result
        let cvr = 0; //currentViewRate
        let pvr = 0; //prevViewRate
        this.eventHandler.remove(eventHandlerKeys['scroll']);
        eventHandlerKeys['scroll'] = this.eventHandler.add(targetWindow, 'atlasVisibilityStatus', () => {
            r = this.utils.getV(null);
            if (r.detail.documentIsVisible !== 'hidden' && r.detail.documentIsVisible !== 'prerender') {
                now = Date.now();
                cvr = Math.round(r.detail.documentScrollRate * steps) * each;
                if (cvr > pvr && cvr >= 0 && cvr <= 100) {
                    setTimeout(() => {
                        if (cvr > pvr) {
                            this.utils.transmit('scroll', 'page', user, context, {
                                'scroll_depth': {
                                    'page_height': r.detail.documentHeight,
                                    'viewed_until': r.detail.documentScrollUntil,
                                    'viewed_percent': cvr,
                                    'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                                    'elapsed_since_prev_action': (now - prev) / 1000
                                }
                            });
                            pvr = cvr;
                        }
                        prev = now;
                    }, limit);
                }
            }
        }, false);
    }

    /**
     * @private
     */
    trackInfinityScroll(step, threshold) {
        const limit = threshold * 1000 || 2 * 1000;
        let now = Date.now();
        let prev = now;
        let r = {}; //result
        let cvp = 0; //currentViewRate
        let pvp = 0; //prevViewRate
        this.eventHandler.remove(eventHandlerKeys['infinityScroll']);
        eventHandlerKeys['infinityScroll'] = this.eventHandler.add(targetWindow, 'atlasVisibilityStatus', () => {
            r = this.utils.getV(null);
            if (r.detail.documentIsVisible !== 'hidden' && r.detail.documentIsVisible !== 'prerender') {
                now = Date.now();
                cvp = r.detail.documentScrollUntil;
                if (cvp > pvp && cvp >= pvp && cvp >= step) {
                    setTimeout(() => {
                        if (cvp > pvp) {
                            this.utils.transmit('infinity_scroll', 'page', user, context, {
                                'scroll_depth': {
                                    'page_height': r.detail.documentHeight,
                                    'viewed_until': cvp,
                                    'viewed_percent': r.detail.documentScrollRate,
                                    'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                                    'elapsed_since_prev_action': (now - prev) / 1000
                                }
                            });
                            pvp = cvp + step;
                        }
                        prev = now;
                    }, limit);
                }
            }
        }, false);
    }

    /**
     * @private
     */
    trackRead(target, granularity, milestones) {
        if (!target) {
            return;
        }
        const each = granularity || 25;
        const steps = 100 / each;
        let now = Date.now();
        let prev = now;
        let r = {}; //result
        let eiv = 0; //elapsedInVisible
        let cm = null; //currentMilestone
        let pm = null; //prevMilestone
        let cvr = 0; //currentViewRate
        let pvr = 0; //prevViewRate
        this.eventHandler.remove(eventHandlerKeys['read']);
        eventHandlerKeys['read'] = this.eventHandler.add(targetWindow, 'atlasVisibilityStatus', () => {
            r = this.utils.getV(target);
            if (r.detail.documentIsVisible !== 'hidden' && r.detail.documentIsVisible !== 'prerender' && r.status.isInView) {
                now = Date.now();
                if (now - prev >= 1000) {
                    prev = now;
                }
                eiv = eiv + (now - prev);
                prev = now;
                milestones.forEach(function (milestone) {
                    if ((eiv / 1000) | 0 >= milestone && now - prev < 1000) {
                        milestones.shift();
                        cm = milestone;
                    }
                });
                if (cm && pm !== cm) {
                    this.utils.transmit('read', 'article', user, context, {
                        'read': {
                            'mode': 'time',
                            'milestone': cm,
                            'page_height': r.detail.documentHeight,
                            'element_height': r.detail.targetHeight,
                            'viewed_from': r.detail.targetVisibleTop,
                            'viewed_until': r.detail.targetVisibleBottom,
                            'viewed_percent': cvr,
                            'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                            'elapsed_since_prev_action': (now - prev) / 1000
                        }
                    });
                    pm = cm;
                    cm = null;
                }
                cvr = Math.round(r.detail.targetScrollRate * steps) * each;
                if (cvr > pvr && cvr >= 0 && cvr <= 100) {
                    setTimeout(() => {
                        if (cvr > pvr) {
                            this.utils.transmit('read', 'article', user, context, {
                                'read': {
                                    'mode': 'scroll',
                                    'page_height': r.detail.documentHeight,
                                    'element_height': r.detail.targetHeight,
                                    'viewed_from': r.detail.targetVisibleTop,
                                    'viewed_until': r.detail.targetVisibleBottom,
                                    'viewed_percent': cvr,
                                    'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                                    'elapsed_since_prev_action': (now - prev) / 1000
                                }
                            });
                            pvr = cvr;
                        }
                    }, 1000);
                }
            }
        }, false);
    }

    /**
     * @private
     */
    trackViewability(targets) {
        let now = Date.now();
        let r = {}; //results
        let f = {}; //flags
        this.eventHandler.remove(eventHandlerKeys['viewability']);
        eventHandlerKeys['viewability'] = this.eventHandler.add(targetWindow, 'atlasVisibilityStatus', () => {
            for (let i = 0; i < targets.length; i++) {
                if (targets[i]) {
                    r[i] = this.utils.getV(targets[i]);
                    if (r[i].status.isInView === true && r[i].detail.documentIsVisible !== 'hidden' && r[i].detail.documentIsVisible !== 'prerender' && r[i].detail.targetViewableRate >= 0.5 && !f[i]) {
                        setTimeout(() => {
                            if (r[i].detail.targetViewableRate >= 0.5 && !f[i]) {
                                now = Date.now();
                                f[i] = true;
                                this.utils.transmit('viewable_impression', 'ad', user, context, {
                                    'viewability': {
                                        'page_height': r[i].detail.documentHeight,
                                        'element_order_in_target': i,
                                        'element_tag': targets[i].tagName,
                                        'element_class': targets[i].className,
                                        'element_id': targets[i].id,
                                        'element_height': r[i].detail.targetHeight,
                                        'elapsed_since_page_load': (now - pageLoadedAt) / 1000
                                    }
                                });
                            }
                        }, 1000);
                    }
                }
            }
        }, false);
    }

    /**
     * @private
     */
    trackMedia(selector, heartbeat) {
        const targetEvents = ['play', 'pause', 'end'];
        let f = {}; //flags
        for (let i = 0; i < targetEvents.length; i++) {
            this.eventHandler.remove(eventHandlerKeys['media'][targetEvents[i]]);
            eventHandlerKeys['media'][targetEvents[i]] = this.eventHandler.add(targetWindow.document.body, targetEvents[i], (ev) => {
                if (this.utils.qsM(selector, ev.target)) {
                    const details = this.utils.getM(ev.target);
                    this.utils.transmit(targetEvents[i], details.tag, user, context, {
                        'media': details
                    });
                }
            }, {capture: true});
        }

        this.eventHandler.remove(eventHandlerKeys['media']['timeupdate']);
        eventHandlerKeys['media']['timeupdate'] = this.eventHandler.add(targetWindow.document, 'timeupdate', (ev) => {
            if (this.utils.qsM(selector, ev.target)) {
                const details = this.utils.getM(ev.target);
                const index = details.tag + '-' + details.id + '-' + details.src;
                if (f[index]) {
                    return false;
                }
                f[index] = setTimeout(() => {
                    if (ev.target.paused !== true && ev.target.ended !== true) {
                        this.utils.transmit('playing', details.tag, user, context, {
                            'media': details
                        });
                    }
                    f[index] = false;
                }, heartbeat * 1000);
            }
        }, {capture: true});
    }

    trackForm(target) {
        if (!target) {
            return;
        }
        const targetEvents = ['focus', 'change'];
        let f = {
            'name': target.name || target.id || '-',
            'dataset': target.dataset,
            'items_detail': {}
        };
        for (let i = 0; i < targetEvents.length; i++) {
            this.eventHandler.remove(eventHandlerKeys['form'][targetEvents[i]]);
            eventHandlerKeys['form'][targetEvents[i]] = this.eventHandler.add(target, targetEvents[i], (ev) => {
                f = this.utils.getF(f, targetEvents[i], ev.target, pageLoadedAt);
            }, false);
        }
        this.eventHandler.remove(eventHandlerKeys['unload']);
        eventHandlerKeys['unload'] = this.eventHandler.add(targetWindow, unloadEvent, () => {
            this.utils.transmit('track', 'form', user, context, {
                'form': f
            });
        }, false);
    }
}
