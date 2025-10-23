import { describe, it, expect, beforeEach, vi } from 'vitest';
import Utils from '../src/utils';

describe('#transmit', () => {
    const utils = new Utils(globalThis);
    const sendBeaconMock = vi.spyOn(navigator, 'sendBeacon').mockImplementation(() => true);
    const xhrMock = vi.spyOn(utils, 'xhr').mockImplementation(() => {});
    const fetchMock = vi.spyOn(utils.targetWindow, 'fetch').mockImplementation(() => Promise.resolve({}));

    const byteSize = (s) => {
      return s.replace(/%../g, '*').length
    };

    beforeEach(() => {
        utils.initSystem({
          endpoint: "example.com",
          apiKey: "xxxxxxxxx",
        })

        sendBeaconMock.mockClear();
        xhrMock.mockClear();
        fetchMock.mockClear();

        utils.setSendBeaconStatusForTestUse(true);
    })

    it('should send ingest data by sendBeacon with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup mock
        sendBeaconMock.mockReturnValue(true);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(sendBeaconMock).toHaveBeenCalledTimes(1);

        const sendBeaconArgs = sendBeaconMock.mock.calls[0];
        expect(sendBeaconArgs[1]).toBeTruthy();
        expect(sendBeaconArgs[1].size).toBeGreaterThan(8 * 1 << 10)
        expect(sendBeaconArgs[1].type).toBe("application/json")
        expect(xhrMock).toHaveBeenCalledTimes(0);
    })

    it('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup mock
        sendBeaconMock.mockReturnValue(false);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(xhrMock).toHaveBeenCalledTimes(1);

        const xhrMockArgs = xhrMock.mock.calls[0]
        expect(xhrMockArgs[2]).toBe('POST')
        expect(byteSize(xhrMockArgs[3])).toBeGreaterThan(8 * 1 << 10);
    })

    it('should send ingest data by fetch with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup
        utils.setSendBeaconStatusForTestUse(false);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const fetchMockArgs = fetchMock.mock.calls[0]

        expect(fetchMockArgs[1]['method']).toBe('POST')
        expect(fetchMockArgs[1]['body'].size).toBeGreaterThan(8 * 1 << 10);
        expect(fetchMockArgs[1]['body'].type).toBe('application/json');
        expect(fetchMockArgs[1]['headers']['Content-Type']).toBe('application/json');
        expect(sendBeaconMock).toHaveBeenCalledTimes(0);
        expect(xhrMock).toHaveBeenCalledTimes(0);
    })

    it('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k and fetch function is not implemented.', () => {
        // setup mock
        utils.setSendBeaconStatusForTestUse(false);

        const originalFetch = utils.targetWindow.fetch;
        delete utils.targetWindow.fetch;

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(fetchMock).toHaveBeenCalledTimes(0);
        expect(sendBeaconMock).toHaveBeenCalledTimes(0);

        const xhrMockArgs = xhrMock.mock.calls[0]
        expect(xhrMockArgs[2]).toBe('POST')
        expect(byteSize(xhrMockArgs[3])).toBeGreaterThan(8 * 1 << 10);

        // cleanup
        utils.targetWindow.fetch = originalFetch;
    })


    it('should send ingest data by sendBeacon with HTTP GET when request url size is less than 8k', () => {
        // setup mock
        sendBeaconMock.mockReturnValue(true);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(sendBeaconMock).toHaveBeenCalledTimes(1);
        expect(sendBeaconMock.mock.calls[0][1]).toBeNull();
        expect(byteSize(sendBeaconMock.mock.calls[0][0])).toBeLessThan(8 * 1 << 10);
        expect(xhrMock).toHaveBeenCalledTimes(0);
    })

    it('should send ingest data by fetch with HTTP GET when request url size is less than 8k', () => {
        // setup
        utils.setSendBeaconStatusForTestUse(false);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][1]['method']).toBe('GET')
        expect(byteSize(fetchMock.mock.calls[0][0])).toBeLessThan(8 * 1 << 10);
        expect(sendBeaconMock).toHaveBeenCalledTimes(0);
        expect(xhrMock).toHaveBeenCalledTimes(0);
    })

    it('should send ingest data by xhr with HTTP GET when request url size is less than 8k and fetch function is not implemented.', () => {
        // setup mock
        utils.setSendBeaconStatusForTestUse(false);
        sendBeaconMock.mockReturnValue(true);

        const originalFetch = utils.targetWindow.fetch;
        delete utils.targetWindow.fetch;

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(fetchMock).toHaveBeenCalledTimes(0);
        expect(sendBeaconMock).toHaveBeenCalledTimes(0);
        expect(xhrMock).toHaveBeenCalledTimes(1);
        expect(byteSize(xhrMock.mock.calls[0][0])).toBeLessThan(8 * 1 << 10);
        expect(xhrMock.mock.calls[0][2]).toBe('GET')

        // cleanup
        utils.targetWindow.fetch = originalFetch;
    })

    it('should send ingest data by xhr with HTTP GET when request url size is less than 8k', () => {
        // setup mock
        sendBeaconMock.mockReturnValue(false);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(xhrMock).toHaveBeenCalledTimes(1);
        expect(xhrMock.mock.calls[0][2]).toBe('GET')
        expect(byteSize(xhrMock.mock.calls[0][0])).toBeLessThan(8 * 1 << 10);
    })
})
