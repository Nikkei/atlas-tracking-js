import Utils from '../src/utils';
import {expect} from 'chai';
import sinon from 'sinon';

describe('#getP', () => {
    let utils;
    beforeEach(() => {
        utils = new Utils(window.parent)
    })

    it('should return performance info.', () => {
        let info = utils.getP()
        let t = info.navigationType
        let r = info.performanceResult

        expect(t).to.be.a('PerformanceNavigation')
        expect(r.unload).to.not.be.NaN
        expect(r.redirect).to.not.be.NaN
        expect(r.dns).to.not.be.NaN
        expect(r.request).to.not.be.NaN
        expect(r.response).to.not.be.NaN
        expect(r.dom).to.not.be.NaN
        expect(r.domContent).to.not.be.NaN
        expect(r.onload).to.not.be.NaN
        expect(r.untilResponseComplete).to.not.be.NaN
        expect(r.untilDomComplete).to.not.be.NaN
    })
})

describe('#transmit', () => {
    const utils = new Utils(window.parent);
    const sendBeaconStub = sinon.stub(navigator, 'sendBeacon');
    const xhrStub = sinon.stub(utils, 'xhr');
    const fetchStub = sinon.stub(utils.targetWindow, 'fetch');

    const byteSize = (s) => {
      return s.replace(/%../g, '*').length
    };

    before(() => {
        utils.initSystem({
          endpoint: "example.com",
          apiKey: "xxxxxxxxx",
        })
    })

    beforeEach(() => {
        sendBeaconStub.reset();
        xhrStub.reset();
        fetchStub.reset();

        utils.setSendBeaconStatusForTestUse(true);
    })

    it('should send ingest data by sendBeacon with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup stub
        sendBeaconStub.returns(true);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(sendBeaconStub.callCount).to.be.equal(1);

        const sendBeaconArgs = sendBeaconStub.getCall(0).args;
        expect(sendBeaconArgs[1]).to.not.null;
        expect(sendBeaconArgs[1].size).to.be.gt(8 * 1 << 10)
        expect(sendBeaconArgs[1].type).to.be.equal("application/json")
        expect(xhrStub.callCount).to.be.equal(0);
    })

    it('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup stub
        sendBeaconStub.returns(false);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(xhrStub.callCount).to.be.equal(1);

        const xhrStubArgs = xhrStub.getCall(0).args
        expect(xhrStubArgs[2]).to.be.equal('POST')
        expect(byteSize(xhrStubArgs[3])).to.be.gt(8 * 1 << 10);
    })

    it('should send ingest data by fetch with HTTP POST with Body when request url size is greater than 8k', () => {
        // setup
        utils.setSendBeaconStatusForTestUse(false);

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(fetchStub.callCount).to.be.equal(1);
        const fetchStubArgs = fetchStub.getCall(0).args

        expect(fetchStubArgs[1]['method']).to.be.equal('POST')
        expect(fetchStubArgs[1]['body'].size).to.be.gt(8 * 1 << 10);
        expect(fetchStubArgs[1]['body'].type).to.be.equal('application/json');
        expect(fetchStubArgs[1]['headers']['Content-Type']).to.be.equal('application/json');
        expect(sendBeaconStub.callCount).to.be.equal(0);
        expect(xhrStub.callCount).to.be.equal(0);
    })

    it('should send ingest data by xhr with HTTP POST with Body when request url size is greater than 8k and fetch function is not implemented.', () => {
        // setup stub
        utils.setSendBeaconStatusForTestUse(false);

        const originalFetch = utils.targetWindow.fetch;
        delete utils.targetWindow.fetch;

        // call HTTP request
        utils.transmit('unload', 'page', {
          "custom": "x".repeat(8 * (1 << 10))
        }, {}, {});

        // asserts
        expect(fetchStub.callCount).to.be.equal(0);
        expect(sendBeaconStub.callCount).to.be.equal(0);

        const xhrStubArgs = xhrStub.getCall(0).args
        expect(xhrStubArgs[2]).to.be.equal('POST')
        expect(byteSize(xhrStubArgs[3])).to.be.gt(8 * 1 << 10);

        // cleanup
        utils.targetWindow.fetch = originalFetch;
    })


    it('should send ingest data by sendBeacon with HTTP GET when request url size is less than 8k', () => {
        // setup stub
        sendBeaconStub.returns(true);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(sendBeaconStub.callCount).to.be.equal(1);
        expect(sendBeaconStub.getCall(0).args[1]).to.be.null;
        expect(byteSize(sendBeaconStub.getCall(0).args[0])).to.be.lt(8 * 1 << 10);
        expect(xhrStub.callCount).to.be.equal(0);
    })

    it('should send ingest data by fetch with HTTP GET when request url size is less than 8k', () => {
        // setup
        utils.setSendBeaconStatusForTestUse(false);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(fetchStub.callCount).to.be.equal(1);
        expect(fetchStub.getCall(0).args[1]['method']).to.be.equal('GET')
        expect(byteSize(fetchStub.getCall(0).args[0])).to.be.lt(8 * 1 << 10);
        expect(sendBeaconStub.callCount).to.be.equal(0);
        expect(xhrStub.callCount).to.be.equal(0);
    })

    it('should send ingest data by xhr with HTTP GET when request url size is less than 8k and fetch function is not implemented.', () => {
        // setup stub
        utils.setSendBeaconStatusForTestUse(false);
        sendBeaconStub.returns(true);

        const originalFetch = utils.targetWindow.fetch;
        delete utils.targetWindow.fetch;

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(fetchStub.callCount).to.be.equal(0);
        expect(sendBeaconStub.callCount).to.be.equal(0);
        expect(xhrStub.callCount).to.be.equal(1);
        expect(byteSize(xhrStub.getCall(0).args[0])).to.be.lt(8 * 1 << 10);
        expect(xhrStub.getCall(0).args[2]).to.be.equal('GET')

        // cleanup
        utils.targetWindow.fetch = originalFetch;
    })

    it('should send ingest data by xhr with HTTP GET when request url size is less than 8k', () => {
        // setup stub
        sendBeaconStub.returns(false);

        // call HTTP request
        utils.transmit('unload', 'page', { custom_object: {} }, {}, {});

        // asserts
        expect(xhrStub.callCount).to.be.equal(1);
        expect(xhrStub.getCall(0).args[2]).to.be.equal('GET')
        expect(byteSize(xhrStub.getCall(0).args[0])).to.be.lt(8 * 1 << 10);
    })
})
