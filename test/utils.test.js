import Utils from '../src/utils';
const host = 'https://example.com'

describe('#getP', () => {
    let utils;
    beforeEach(() => {
        utils = new Utils()
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
