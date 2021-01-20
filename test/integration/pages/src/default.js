import AtlasTracking from '../../../../src/index.js';

const atlasTracking = new AtlasTracking();
window.atlasTracking = atlasTracking;

document.addEventListener('DOMContentLoaded', function () {
    atlasTracking.config({
        'system': {
            'endpoint': 'localhost:1234',
            'beaconTimeout': 2000,
            'cookieName': 'atlasId',
            'cookieMaxAge': (2 * 365 * 24 * 60 * 60),
            'cookieDomain': 'CHANGE_ME'
        },
        'debug': {
            'outputLog': true
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
            'useGet': true,
            'exchangeAtlasId': {
                'pass': false,
                'passParamKey': 'atlas_id',
                'passTargetDomains': [],
                'catch': false,
                'catchParamKey': 'atlas_id',
                'catchTargetDomains': [],
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
                'targets': [],
                'heartbeat': 5,
            },
            'trackUnload': {
                'enable': true,
            },
            'trackForm': {
                'enable': false,
                'targets': [],
            },
            'observeMutation': false,
            'dataSrc': ''
        }
    });

    // Init Page data
    atlasTracking.initPage({
        user: {
            'user_id': null,
            'user_status': null,
            'site_session': null
        },
        context: {
            'app': null,
            'app_version': null,
            'source': null,
            'edition': null,
            'content_id': null,
            'content_name': null,
            'content_status': null,
            'page_name': null,
            'page_num': null,
            'category_l1': null,
            'category_l2': null,
            'category_l3': null,
            'tracking_code': atlasTracking.getQueryValue('cid'),
            'campaign': {
                'name': decodeURIComponent(atlasTracking.getQueryValue('utm_campaign')),
                'source': decodeURIComponent(atlasTracking.getQueryValue('utm_source')),
                'medium': decodeURIComponent(atlasTracking.getQueryValue('utm_medium')),
                'term': decodeURIComponent(atlasTracking.getQueryValue('utm_term')),
                'content': decodeURIComponent(atlasTracking.getQueryValue('utm_content')),
            },
            'search': {
                'term': null,
                'options': null,
                'results': null
            },
            'events': null,
            'custom_object': {},
            'funnel': {}
        }
    });
});
