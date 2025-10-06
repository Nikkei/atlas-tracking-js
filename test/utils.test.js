import { test, expect } from '@playwright/test';

test.describe('#getP', () => {
    test('should return performance info.', async ({ page }) => {
        await page.goto('/test/fixture.html');

        const utils = await page.evaluate(() => {
            const Utils = window.Utils;
            const utils = new Utils(window.parent);
            const info = utils.getP();
            return {
                navigationType: info.navigationType ? info.navigationType.constructor.name : null,
                performanceResult: info.performanceResult
            };
        });

        const r = utils.performanceResult;

        expect(utils.navigationType).toBe('PerformanceNavigation');
        expect(isNaN(r.unload)).toBe(false);
        expect(isNaN(r.redirect)).toBe(false);
        expect(isNaN(r.dns)).toBe(false);
        expect(isNaN(r.request)).toBe(false);
        expect(isNaN(r.response)).toBe(false);
        expect(isNaN(r.dom)).toBe(false);
        expect(isNaN(r.domContent)).toBe(false);
        expect(isNaN(r.onload)).toBe(false);
        expect(isNaN(r.untilResponseComplete)).toBe(false);
        expect(isNaN(r.untilDomComplete)).toBe(false);
    });
});

test.describe('#transmit', () => {
    const byteSize = (s) => {
        return s.replace(/%../g, '*').length;
    };

    test.beforeEach(async ({ page }) => {
        await page.goto('/test/fixture.html');

        await page.evaluate(() => {
            window.sendBeaconCalls = [];
            window.xhrCalls = [];
            window.fetchCalls = [];

            const originalSendBeacon = navigator.sendBeacon.bind(navigator);
            navigator.sendBeacon = function(...args) {
                window.sendBeaconCalls.push(args);
                return window.sendBeaconReturnValue !== undefined ? window.sendBeaconReturnValue : true;
            };

            window.XMLHttpRequest = class MockXMLHttpRequest {
                open(method, url) {
                    this.method = method;
                    this.url = url;
                }
                send(body) {
                    // Store Blob info for testing
                    let bodyContent = body;
                    let bodySize = 0;
                    if (body instanceof Blob) {
                        bodySize = body.size;
                        // Store the blob for async processing
                        window.xhrCalls.push([this.url, null, this.method, body]);
                    } else {
                        window.xhrCalls.push([this.url, null, this.method, bodyContent]);
                    }
                }
                setRequestHeader() {}
            };

            const Utils = window.Utils;
            window.utils = new Utils(window.parent);
            window.utils.initSystem({
                endpoint: "example.com",
                apiKey: "xxxxxxxxx",
            });
        });
    });

    test('should send ingest data by sendBeacon with HTTP POST with Body when request url size is greater than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.sendBeaconReturnValue = true;
            window.utils.setSendBeaconStatusForTestUse(true);
            window.utils.transmit('unload', 'page', {
                "custom": "x".repeat(8 * (1 << 10))
            }, {}, {});
        });

        const result = await page.evaluate(() => ({
            sendBeaconCallCount: window.sendBeaconCalls.length,
            sendBeaconArg1: window.sendBeaconCalls[0] ? {
                hasBody: window.sendBeaconCalls[0][1] !== null,
                bodySize: window.sendBeaconCalls[0][1]?.size,
                bodyType: window.sendBeaconCalls[0][1]?.type
            } : null,
            xhrCallCount: window.xhrCalls.length
        }));

        expect(result.sendBeaconCallCount).toBe(1);
        expect(result.sendBeaconArg1.hasBody).toBe(true);
        expect(result.sendBeaconArg1.bodySize).toBeGreaterThan(8 * 1 << 10);
        expect(result.sendBeaconArg1.bodyType).toBe("application/json");
        expect(result.xhrCallCount).toBe(0);
    });

    test('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.sendBeaconReturnValue = false;
            window.utils.setSendBeaconStatusForTestUse(true);
            window.utils.transmit('unload', 'page', {
                "custom": "x".repeat(8 * (1 << 10))
            }, {}, {});
        });

        const result = await page.evaluate(async () => {
            const body = window.xhrCalls[0]?.[3];
            let bodyLength = 0;
            if (body instanceof Blob) {
                bodyLength = body.size;
            } else if (typeof body === 'string') {
                bodyLength = body.length;
            }
            return {
                xhrCallCount: window.xhrCalls.length,
                xhrMethod: window.xhrCalls[0]?.[2],
                xhrBodyLength: bodyLength
            };
        });

        expect(result.xhrCallCount).toBe(1);
        expect(result.xhrMethod).toBe('POST');
        expect(result.xhrBodyLength).toBeGreaterThan(8 * 1 << 10);
    });

    test('should send ingest data by fetch with HTTP POST with Body when request url size is greater than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.utils.setSendBeaconStatusForTestUse(false);

            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                window.fetchCalls.push(args);
                return originalFetch.apply(this, args).catch(() => new Response());
            };

            window.utils.transmit('unload', 'page', {
                "custom": "x".repeat(8 * (1 << 10))
            }, {}, {});
        });

        const result = await page.evaluate(() => ({
            fetchCallCount: window.fetchCalls.length,
            fetchMethod: window.fetchCalls[0]?.[1]?.method,
            fetchBodySize: window.fetchCalls[0]?.[1]?.body?.size,
            fetchBodyType: window.fetchCalls[0]?.[1]?.body?.type,
            fetchHeaderContentType: window.fetchCalls[0]?.[1]?.headers?.['Content-Type'],
            sendBeaconCallCount: window.sendBeaconCalls.length,
            xhrCallCount: window.xhrCalls.length
        }));

        expect(result.fetchCallCount).toBe(1);
        expect(result.fetchMethod).toBe('POST');
        expect(result.fetchBodySize).toBeGreaterThan(8 * 1 << 10);
        expect(result.fetchBodyType).toBe('application/json');
        expect(result.fetchHeaderContentType).toBe('application/json');
        expect(result.sendBeaconCallCount).toBe(0);
        expect(result.xhrCallCount).toBe(0);
    });

    test('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k and fetch function is not implemented.', async ({ page }) => {
        await page.evaluate(() => {
            window.utils.setSendBeaconStatusForTestUse(false);

            window.originalFetch = window.fetch;
            delete window.fetch;

            window.utils.transmit('unload', 'page', {
                "custom": "x".repeat(8 * (1 << 10))
            }, {}, {});

            window.fetch = window.originalFetch;
        });

        const result = await page.evaluate(async () => {
            const body = window.xhrCalls[0]?.[3];
            let bodyLength = 0;
            if (body instanceof Blob) {
                bodyLength = body.size;
            } else if (typeof body === 'string') {
                bodyLength = body.length;
            }
            return {
                fetchCallCount: window.fetchCalls.length,
                sendBeaconCallCount: window.sendBeaconCalls.length,
                xhrCallCount: window.xhrCalls.length,
                xhrMethod: window.xhrCalls[0]?.[2],
                xhrBodyLength: bodyLength
            };
        });

        expect(result.fetchCallCount).toBe(0);
        expect(result.sendBeaconCallCount).toBe(0);
        expect(result.xhrCallCount).toBe(1);
        expect(result.xhrMethod).toBe('POST');
        expect(result.xhrBodyLength).toBeGreaterThan(8 * 1 << 10);
    });

    test('should send ingest data by sendBeacon with HTTP GET when request url size is less than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.sendBeaconReturnValue = true;
            window.utils.setSendBeaconStatusForTestUse(true);
            window.utils.transmit('unload', 'page', { custom_object: {} }, {}, {});
        });

        const result = await page.evaluate(() => ({
            sendBeaconCallCount: window.sendBeaconCalls.length,
            sendBeaconUrl: window.sendBeaconCalls[0]?.[0],
            sendBeaconBody: window.sendBeaconCalls[0]?.[1],
            xhrCallCount: window.xhrCalls.length
        }));

        expect(result.sendBeaconCallCount).toBe(1);
        expect(result.sendBeaconBody).toBe(null);
        expect(byteSize(result.sendBeaconUrl)).toBeLessThan(8 * 1 << 10);
        expect(result.xhrCallCount).toBe(0);
    });

    test('should send ingest data by fetch with HTTP GET when request url size is less than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.utils.setSendBeaconStatusForTestUse(false);

            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                window.fetchCalls.push(args);
                return originalFetch.apply(this, args).catch(() => new Response());
            };

            window.utils.transmit('unload', 'page', { custom_object: {} }, {}, {});
        });

        const result = await page.evaluate(() => ({
            fetchCallCount: window.fetchCalls.length,
            fetchMethod: window.fetchCalls[0]?.[1]?.method,
            fetchUrl: window.fetchCalls[0]?.[0],
            sendBeaconCallCount: window.sendBeaconCalls.length,
            xhrCallCount: window.xhrCalls.length
        }));

        expect(result.fetchCallCount).toBe(1);
        expect(result.fetchMethod).toBe('GET');
        expect(byteSize(result.fetchUrl)).toBeLessThan(8 * 1 << 10);
        expect(result.sendBeaconCallCount).toBe(0);
        expect(result.xhrCallCount).toBe(0);
    });

    test('should send ingest data by xhr with HTTP GET when request url size is less than 8k and fetch function is not implemented.', async ({ page }) => {
        await page.evaluate(() => {
            window.utils.setSendBeaconStatusForTestUse(false);
            window.sendBeaconReturnValue = true;

            window.originalFetch = window.fetch;
            delete window.fetch;

            window.utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

            window.fetch = window.originalFetch;
        });

        const result = await page.evaluate(() => ({
            fetchCallCount: window.fetchCalls.length,
            sendBeaconCallCount: window.sendBeaconCalls.length,
            xhrCallCount: window.xhrCalls.length,
            xhrUrl: window.xhrCalls[0]?.[0],
            xhrMethod: window.xhrCalls[0]?.[2]
        }));

        expect(result.fetchCallCount).toBe(0);
        expect(result.sendBeaconCallCount).toBe(0);
        expect(result.xhrCallCount).toBe(1);
        expect(byteSize(result.xhrUrl)).toBeLessThan(8 * 1 << 10);
        expect(result.xhrMethod).toBe('GET');
    });

    test('should send ingest data by xhr with HTTP GET when request url size is less than 8k', async ({ page }) => {
        await page.evaluate(() => {
            window.sendBeaconReturnValue = false;
            window.utils.setSendBeaconStatusForTestUse(true);
            window.utils.transmit('unload', 'page', { custom_object: {} }, {}, {});
        });

        const result = await page.evaluate(() => ({
            xhrCallCount: window.xhrCalls.length,
            xhrMethod: window.xhrCalls[0]?.[2],
            xhrUrl: window.xhrCalls[0]?.[0]
        }));

        expect(result.xhrCallCount).toBe(1);
        expect(result.xhrMethod).toBe('GET');
        expect(byteSize(result.xhrUrl)).toBeLessThan(8 * 1 << 10);
    });
});
