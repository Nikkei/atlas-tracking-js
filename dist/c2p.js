(function () {
    // Cutting The Mustard!
    if ('querySelector' in window.parent.document &&
        'addEventListener' in window.parent
    ) {

        // Configure
        atlasTracking.config({
            'system': {
                'endpoint': 'CHANGE_ME',
                'apiKey': 'CHANGE_ME',
                'beaconTimeout': 2000,
                'cookieName': 'atlasId',
                'cookieMaxAge': (2 * 365 * 24 * 60 * 60),
                'cookieDomain': 'CHANGE_ME',
                'targetWindow': 'self'
            },
            'defaults': {
                'pageUrl': window.parent.document.location.href,
                'pageReferrer': window.parent.document.referrer,
                'pageTitle': window.parent.document.title,
            },
            'product': {
                'productFamily': 'CHANGE_ME',
                'productName': 'CHANGE_ME'
            },
            'options': {
                'trackClick': {
                    'enable': true,
                    'targetAttribute': 'data-atlas-trackable',
                },
                'trackLink': {
                    'enable': true,
                    'internalDomains': ['CHANGE_ME'],
                    'nameAttribute': 'data-atlas-link-name',
                },
                'trackDownload': {
                    'enable': true,
                    'fileExtensions': ['pdf', 'zip', 'laz', 'tar', 'gz', 'tgz', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'],
                    'nameAttribute': 'data-atlas-link-name',
                },
                'trackNavigation': {
                    'enable': true,
                },
                'trackPerformance': {
                    'enable': true,
                },
                'trackScroll': {
                    'enable': true,
                    'granularity': 20,
                    'threshold': 2,
                },
                'trackInfinityScroll': {
                    'enable': false,
                    'step': 600,
                    'threshold': 2,
                },
                'trackRead': {
                    'enable': false,
                    'target': null,
                    'granularity': 25,
                    'milestones': [4, 15, 30, 60, 90, 120],
                },
                'trackViewability': {
                    'enable': false,
                    'targets': [],
                },
                'trackMedia': {
                    'enable': false,
                    'selector': 'video, audio',
                    'heartbeat': 5,
                },
                'trackForm': {
                    'enable': false,
                    'target': null,
                },
                'trackUnload': {
                    'enable': true,
                },
                'trackThroughMessage': {
                    'enable': true,
                }
            }
        });

        // Init Page data
        atlasTracking.initPage({
            user: {
                'user_id': undefined,
                'user_status': undefined,
                'site_session': undefined
            },
            context: {
                'app': undefined,
                'app_version': undefined,
                'source': undefined,
                'edition': undefined,
                'content_id': undefined,
                'content_name': undefined,
                'content_status': undefined,
                'page_name': undefined,
                'page_num': undefined,
                'category_l1': undefined,
                'category_l2': undefined,
                'category_l3': undefined,
                'tracking_code': atlasTracking.getQueryValue('cid'),
                'campaign': {
                    'name': decodeURIComponent(atlasTracking.getQueryValue('utm_campaign')) || undefined,
                    'source': decodeURIComponent(atlasTracking.getQueryValue('utm_source')) || undefined,
                    'medium': decodeURIComponent(atlasTracking.getQueryValue('utm_medium')) || undefined,
                    'term': decodeURIComponent(atlasTracking.getQueryValue('utm_term')) || undefined,
                    'content': decodeURIComponent(atlasTracking.getQueryValue('utm_content')) || undefined,
                },
                'search': {
                    'term': undefined,
                    'options': undefined,
                    'results': undefined
                },
                'events': undefined,
                'custom_object': {},
                'funnel': {}
            }
        });

        // Send PV
        atlasTracking.trackPage();
    }
}());
