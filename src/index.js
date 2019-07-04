'use strict';

import Utils from './utils.js';

const utils = new Utils;
const eventHandler = new utils.handler;

let debug = {};
let system = {};
let options = {};
let user = {};
let context = {};
let mandatories = {};
let dataSrc = {};
let defaults = {};
let supplement = {};
let performanceInfo = {};
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

let unloadEvent = null;
if ('onbeforeunload' in window.parent) {
    unloadEvent = 'beforeunload';
} else if ('onpagehide' in window.parent) {
    unloadEvent = 'pagehide';
} else {
    unloadEvent = 'unload';
}

export default class AtlasTracking {
    constructor() {
        let event = null;
        try {
            event = new CustomEvent('atlasVisibilityStatus');
        } catch (e) {
            event = window.parent.document.createEvent('CustomEvent');
            event.initCustomEvent('atlasVisibilityStatus', false, false, {});
        }
        let requestAnimationFrame = window.parent.requestAnimationFrame || window.parent.mozRequestAnimationFrame || window.parent.webkitRequestAnimationFrame || window.parent.msRequestAnimationFrame;

        if (requestAnimationFrame) {
            window.parent.requestAnimationFrame = requestAnimationFrame;
        } else {
            let lastTime = 0;
            window.parent.requestAnimationFrame = function (callback) {
                let currTime = Date.now();
                let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                let id = window.parent.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        let timerFrequency = null;
        (function visibilityWatcher() {
            window.parent.requestAnimationFrame(visibilityWatcher);
            if (timerFrequency) {
                return false;
            }
            timerFrequency = setTimeout(function () {
                window.parent.dispatchEvent(event);
                timerFrequency = null;
            }, 250);
        })();
    }

    /**
     * get current url's query value associated with argument.
     * @param  {string} k key of the query parameters.
     * @return {string}   value associated with the key.
     */
    getQueryValue(k) {
        return utils.getQ(k) || '';
    }

    /**
     * get current cookie value associated with argument.
     * @param  {string} k key of the cookie value.
     * @return {string}   value associated with the key.
     */
    getCookieValue(k) {
        return utils.getC(k) || '';
    }


    /**
     * get current localStorage value associated with argument.
     * @param  {string} k key of the localStorage index key.
     * @return {string}   value associated with the key.
     */
    getLocalStorageValue(k) {
        return utils.getLS(k) || '';
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
        return utils.getV(t) || '';
    }

    /**
     * configure atlas tracking.
     * @param  {Object} obj configuration object.
     */
    config(obj) {
        defaults.url = obj.defaults.pageUrl !== void 0 ? obj.defaults.pageUrl : window.parent.document.location.href;
        defaults.referrer = obj.defaults.pageReferrer !== void 0 ? obj.defaults.pageReferrer : window.parent.document.referrer;
        defaults.page_title = obj.defaults.pageTitle !== void 0 ? obj.defaults.pageTitle : window.parent.document.title;
        defaults.product_family = obj.product.productFamily !== void 0 ? obj.product.productFamily : null;
        defaults.product = obj.product.productName !== void 0 ? obj.product.productName : null;
        system = obj.system !== void 0 ? obj.system : {};
        debug = obj.debug !== void 0 ? obj.debug : {};
        options = obj.options !== void 0 ? obj.options : {};
        utils.initSystem(system);
        if (utils.getC('atlasOutputLog') === 'true' || (debug && debug.outputLog)) {
            debug.outputLog = true;
            console.log('ATJ configured');
        }
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
     * toggle optout.
     * if optout is enabled, tracking is disabled.
     * @param  {string} s whether optout is enabled or not. ('enable'|'disable')
     */
    optout(s) {
        let c = utils.getLS('atlasOptout');
        if (s === 'enable') {
            utils.setLS('atlasOptout', true);
        } else if (s === 'disable') {
            utils.delLS('atlasOptout');
        } else {
            if (c === 'true') {
                console.log('enabled');
            } else {
                console.log('disabled');
            }
        }
    }

    /**
     * re-attach event listeners to DOMs.
     */
    initEventListeners() {
        if (debug && debug.outputLog) {
            console.log('ATJ initialized EventListeners');
        }
        if ((options.exchangeAtlasId && options.exchangeAtlasId.pass) || (options.trackClick && options.trackClick.enable) || (options.trackLink && options.trackLink.enable) || (options.trackDownload && options.trackDownload.enable)) {
            this.delegateClickEvents({
                'passAtlasId': options.exchangeAtlasId,
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
            window.parent.addEventListener('DOMContentLoaded', function () {
                performanceInfo = utils.getP();
                context.navigation_timing = performanceInfo.performanceResult || {};
                context.navigation_type = performanceInfo.navigationType || {};
            }, false);
        }
    }

    /**
     * initialize atlas tracking per page.
     * @param  {Object} obj initialization config object.
     */
    initPage(obj) {


        if (obj.context !== void 0 && obj.user !== void 0) {
            mandatories = {
                'url': obj.context.url !== void 0 ? obj.context.url : defaults.url,
                'referrer': obj.context.referrer !== void 0 ? obj.context.referrer : defaults.referrer,
                'content_id': obj.context.content_id || '',
                'user_id': obj.user.user_id || ''
            };
        }
        if (obj.user !== void 0) {
            user = {
                'user_status': obj.user.user_status || undefined,
                'site_session': obj.user.site_session || undefined,
                'external_ids': {},
                'custom_object': obj.user.custom_object || {},
                'federation_id': obj.user.federation_id || undefined
            };
        }
        if (obj.context !== void 0) {
            context = {
                'root_id': utils.generateRootId(),
                'product_family': obj.context.product_family !== void 0 ? obj.context.product_family : defaults.product_family,
                'product': obj.context.product || defaults.product,
                'app': obj.context.app || undefined,
                'app_version': obj.context.app_version || undefined,
                'page_title': obj.context.page_title || defaults.page_title,
                'source': obj.context.source || undefined,
                'edition': obj.context.edition || undefined,
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
                'visibility': window.parent.document.visibilityState || 'unknown'
            };
        }

        if (options.trackPerformance && options.trackPerformance.enable) {
            performanceInfo = utils.getP();
            context.navigation_timing = performanceInfo.performanceResult || {};
            context.navigation_type = performanceInfo.navigationType || {};
        }

        if (debug && debug.outputLog) {
            console.log('ATJ initialized Page');
        }

        this.initEventListeners();
    }

    /**
     * remove tracking options and handlers
     */
    disableTracking() {
        if (debug && debug.outputLog) {
            console.log('ATJ removed EventListeners and tracking options');
        }
        if ((options.exchangeAtlasId && options.exchangeAtlasId.pass) || (options.trackClick && options.trackClick.enable) || (options.trackLink && options.trackLink.enable) || (options.trackDownload && options.trackDownload.enable)) {
            eventHandler.remove(eventHandlerKeys['click']);
        }
        if (options.trackUnload && options.trackUnload.enable) {
            eventHandler.remove(eventHandlerKeys['unload']);   
        }
        if (options.trackScroll && options.trackScroll.enable) {
            eventHandler.remove(eventHandlerKeys['scroll']);
        }
        if (options.trackInfinityScroll && options.trackInfinityScroll.enable) {
            eventHandler.remove(eventHandlerKeys['infinityScroll']);
        }
        if (options.trackRead && options.trackRead.enable) {
            eventHandler.remove(eventHandlerKeys['read']);
        }
        if (options.trackViewability && options.trackViewability.enable) {
            eventHandler.remove(eventHandlerKeys['viewability']);
        }
        if (options.trackMedia && options.trackMedia.enable) {
            const targetEvents = ['play', 'pause', 'end'];
            for (const event of targetEvents) {
                eventHandler.remove(eventHandlerKeys['media'][event]);
            }
        }
        if (options.trackForm && options.trackForm.enable && options.trackForm.target !== null) {
            const targetEvents = ['focus', 'change'];
            for (const event of targetEvents) {
                eventHandler.remove(eventHandlerKeys['form'][event]);
            }
        }
        if (options.trackPerformance && options.trackPerformance.enable) {
            window.parent.removeEventListener('DOMContentLoaded');
        }
    }

    /**
     * track page view.
     */
    trackPage() {
        utils.transmit('view', 'page', mandatories, user, context, supplement, options.useGet, debug);
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
        utils.transmit(action, category, mandatories, user, context, {
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
        }, options.useGet, debug);
        context.events = null;
        prevActionOccurredAt = now;
    }

    /**
     * @private
     */
    delegateClickEvents(obj) {
        eventHandler.remove(eventHandlerKeys['click']);
        eventHandlerKeys['click'] = eventHandler.add(window.parent.document.body, 'click', function (ev) {
            const targetAttribute = obj.trackClick && obj.trackClick.targetAttribute ? obj.trackClick.targetAttribute : 'data-trackable';
            const linkElement = utils.qsM('a', ev.target);
            const trackableElement = utils.qsM('a, button, input, [role="button"]', ev.target, targetAttribute);
            let elm = null;
            let ext = null;

            if (linkElement) {
                elm = linkElement.element;
                ext = (elm.pathname || '').match(/.+\/.+?\.([a-z]+([?#;].*)?$)/);

                // Outbound
                if (obj.trackLink && obj.trackLink.enable && elm.hostname && window.parent.location.hostname !== elm.hostname && obj.trackLink.internalDomains.indexOf(elm.hostname) < 0) {
                    utils.transmit('open', 'outbound_link', mandatories, user, context, {
                        'link': {
                            'destination': elm.href || undefined,
                            'dataset': elm.dataset || undefined,
                            'target': elm.target || undefined,
                            'media': elm.media || undefined,
                            'type': elm.type || undefined,
                            'name': obj.trackLink.nameAttribute ? elm.getAttribute(obj.trackLink.nameAttribute) : undefined
                        }
                    }, options.useGet, debug);
                }

                // Download
                if (obj.trackDownload && obj.trackDownload.enable && elm.hostname && ext && obj.trackDownload.fileExtensions.indexOf(ext[1]) >= 0) {
                    utils.transmit('download', 'file', mandatories, user, context, {
                        'download': {
                            'destination': elm.href || undefined,
                            'dataset': elm.dataset || undefined,
                            'target': elm.target || undefined,
                            'media': elm.media || undefined,
                            'type': elm.type || undefined,
                            'name': obj.trackLink.nameAttribute ? elm.getAttribute(obj.trackDownload.nameAttribute) : undefined
                        }
                    }, options.useGet, debug);
                }

                // Passing Atlas ID
                if (obj.passAtlasId && obj.passAtlasId.pass && elm.hostname && window.parent.location.hostname !== elm.hostname && obj.passAtlasId.passTargetDomains.indexOf(elm.hostname) >= 0) {
                    elm.href = utils.buildLink(elm.href, obj.passAtlasId.passParamKey);
                }
            }

            if (trackableElement) {
                elm = trackableElement.element;
                utils.transmit('click', trackableElement.category, mandatories, user, context, {
                    'action': {
                        'name': elm.getAttribute(targetAttribute),
                        'location': trackableElement.path,
                        'destination': elm.href || undefined,
                        'id': elm.id || undefined,
                        'target': elm.target || undefined,
                        'dataset': elm.dataset || undefined
                    }
                }, options.useGet, debug);
            }
        }, false);
    }

    /**
     * @private
     */
    setEventToUnload() {
        eventHandler.remove(eventHandlerKeys['unload']);
        eventHandlerKeys['unload'] = eventHandler.add(window.parent, unloadEvent, function () {
            utils.transmit('unload', 'page', mandatories, user, context, {
                'action': {
                    'name': 'leave_from_page',
                    'elapsed_since_page_load': ((Date.now()) - pageLoadedAt) / 1000
                }
            }, options.useGet, debug);
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
        eventHandler.remove(eventHandlerKeys['scroll']);
        eventHandlerKeys['scroll'] = eventHandler.add(window.parent, 'atlasVisibilityStatus', function () {
            r = utils.getV(null);
            if (r.detail.documentIsVisible !== 'hidden' && r.detail.documentIsVisible !== 'prerender') {
                now = Date.now();
                cvr = Math.round(r.detail.documentScrollRate * steps) * each;
                if (cvr > pvr && cvr >= 0 && cvr <= 100) {
                    setTimeout(function () {
                        if (cvr > pvr) {
                            utils.transmit('scroll', 'page', mandatories, user, context, {
                                'scroll_depth': {
                                    'page_height': r.detail.documentHeight,
                                    'viewed_until': r.detail.documentScrollUntil,
                                    'viewed_percent': cvr,
                                    'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                                    'elapsed_since_prev_action': (now - prev) / 1000
                                }
                            }, options.useGet, debug);
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
        eventHandler.remove(eventHandlerKeys['infinityScroll']);
        eventHandlerKeys['infinityScroll'] = eventHandler.add(window.parent, 'atlasVisibilityStatus', function () {
            r = utils.getV(null);
            if (r.detail.documentIsVisible !== 'hidden' && r.detail.documentIsVisible !== 'prerender') {
                now = Date.now();
                cvp = r.detail.documentScrollUntil;
                if (cvp > pvp && cvp >= pvp && cvp >= step) {
                    setTimeout(function () {
                        if (cvp > pvp) {
                            utils.transmit('infinity_scroll', 'page', mandatories, user, context, {
                                'scroll_depth': {
                                    'page_height': r.detail.documentHeight,
                                    'viewed_until': cvp,
                                    'viewed_percent': r.detail.documentScrollRate,
                                    'elapsed_since_page_load': (now - pageLoadedAt) / 1000,
                                    'elapsed_since_prev_action': (now - prev) / 1000
                                }
                            }, options.useGet, debug);
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
        eventHandler.remove(eventHandlerKeys['read']);
        eventHandlerKeys['read'] = eventHandler.add(window.parent, 'atlasVisibilityStatus', function () {
            r = utils.getV(target);
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
                    utils.transmit('read', 'article', mandatories, user, context, {
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
                    }, options.useGet, debug);
                    pm = cm;
                    cm = null;
                }
                cvr = Math.round(r.detail.targetScrollRate * steps) * each;
                if (cvr > pvr && cvr >= 0 && cvr <= 100) {
                    setTimeout(function () {
                        if (cvr > pvr) {
                            utils.transmit('read', 'article', mandatories, user, context, {
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
                            }, options.useGet, debug);
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
        eventHandler.remove(eventHandlerKeys['viewability']);
        eventHandlerKeys['viewability'] = eventHandler.add(window.parent, 'atlasVisibilityStatus', function () {
            for (let i = 0; i < targets.length; i++) {
                if (targets[i]) {
                    r[i] = utils.getV(targets[i]);
                    if (r[i].status.isInView === true && r[i].detail.documentIsVisible !== 'hidden' && r[i].detail.documentIsVisible !== 'prerender' && r[i].detail.targetViewableRate >= 0.5 && !f[i]) {
                        setTimeout(function () {
                            if (r[i].detail.targetViewableRate >= 0.5 && !f[i]) {
                                now = Date.now();
                                f[i] = true;
                                utils.transmit('viewable_impression', 'ad', mandatories, user, context, {
                                    'viewability': {
                                        'page_height': r[i].detail.documentHeight,
                                        'element_order_in_target': i,
                                        'element_tag': targets[i].tagName,
                                        'element_class': targets[i].className,
                                        'element_id': targets[i].id,
                                        'element_height': r[i].detail.targetHeight,
                                        'elapsed_since_page_load': (now - pageLoadedAt) / 1000
                                    }
                                }, options.useGet, debug);
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
            eventHandler.remove(eventHandlerKeys['media'][targetEvents[i]]);
            eventHandlerKeys['media'][targetEvents[i]] = eventHandler.add(window.parent.document.body, targetEvents[i], function (ev) {
                if (utils.qsM(selector, ev.target)) {
                    const details = utils.getM(ev.target);
                    utils.transmit(targetEvents[i], details.tag, mandatories, user, context, {
                        'media': details
                    }, options.useGet, debug);
                }
            }, {capture: true});
        }

        eventHandler.remove(eventHandlerKeys['media']['timeupdate']);
        eventHandlerKeys['media']['timeupdate'] = eventHandler.add(window.parent.document, 'timeupdate', function (ev) {
            if (utils.qsM(selector, ev.target)) {
                const details = utils.getM(ev.target);
                const index = details.tag + '-' + details.id + '-' + details.src;
                if (f[index]) {
                    return false;
                }
                f[index] = setTimeout(function () {
                    if (ev.target.paused !== true && ev.target.ended !== true) {
                        utils.transmit('playing', details.tag, mandatories, user, context, {
                            'media': details
                        }, options.useGet, debug);
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
            eventHandler.remove(eventHandlerKeys['form'][targetEvents[i]]);
            eventHandlerKeys['form'][targetEvents[i]] = eventHandler.add(target, targetEvents[i], function (ev) {
                f = utils.getF(f, targetEvents[i], ev.target, pageLoadedAt);
            }, false);
        }
        eventHandler.remove(eventHandlerKeys['unload']);
        eventHandlerKeys['unload'] = eventHandler.add(window.parent, unloadEvent, function () {
            utils.transmit('track', 'form', mandatories, user, context, {
                'form': f
            }, options.useGet, debug);
        }, false);
    }
}
