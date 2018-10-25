const expect = require('chai').expect;
const mockServer = require("mockttp").getLocal();
const queryString = require('query-string');
require('babel-polyfill');

beforeEach(() => mockServer.start(1234));
afterEach(() => mockServer.stop());

describe('track page view', () => {
    it('should send beacon to server', () => {
        return browser.url('/pages/html/index.html')
            .then(async () => {
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.execute(() => {
                    atlasTracking.trackPage()
                })
                await browser.pause(1000)
                let requests = await requestMock.getSeenRequests()
                let request = requests[0]
                let queries = queryString.parse(request.url.split('?')[1])
                expect(queries.a).to.equal('view')
                expect(queries.c).to.equal('page')
            })
    });
});

describe('optout', () => {
    context('when passed "enable"', () => {
        it('should set string "true" to cookie', () => {
            return browser.url('/pages/html/index.html')
                .then(async () => {
                    await browser.execute(() => {
                        atlasTracking.optout('enable')
                    })

                    let cookie = await browser.getCookie('atlasOptout')
                    expect(cookie.value).to.equal('true')
                })
        })
    })

    context('when passed "disable"', () => {
        it('should set empty string to cookie', () => {
            return browser.url('/pages/html/index.html')
                .then(async () => {
                    await browser.execute(() => {
                        atlasTracking.optout('disable')
                    })

                    let cookie = await browser.getCookie('atlasOptout')
                    expect(cookie.value).to.equal('')
                })
        })
    })
})

describe('track link', () => {
    it('should be able to track link click', () => {
        return browser.url('/pages/html/index.html')
            .then(async () => {
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.click('#link')
                await browser.pause(1000)

                let requests = await requestMock.getSeenRequests()
                expect(requests.length).to.equal(2)

                let request = requests[0]
                let queries = queryString.parse(request.url.split('?')[1])
                expect(queries.a).to.equal('open')
                expect(queries.c).to.equal('outbound_link')
            })
    })
})

describe('track scroll', () => {
    it('should be able to track scroll', () => {
        return browser.url('/pages/html/index.html')
            .then(async () => {
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.scroll('body', 0, 100)
                await browser.pause(2500)

                let requests = await requestMock.getSeenRequests()
                expect(requests.length).to.equal(1)

                let request = requests[0]
                let queries = queryString.parse(request.url.split('?')[1])
                expect(queries.a).to.equal('scroll')
                expect(queries.c).to.equal('page')
            })
    })
})

describe('track read', () => {
    it('should be able to track reading', () => {
        return browser.url('/pages/html/track_read.html')
            .then(async () => {
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.pause(1500)

                let requests = await requestMock.getSeenRequests()
                expect(requests.length).to.equal(1)

                let request = requests[0]
                let queries = queryString.parse(request.url.split('?')[1])
                expect(queries.a).to.equal('read')
                expect(queries.c).to.equal('article')
            })
    })
})

describe('track viewability', () => {
    it('should be able to track viewability', () => {
        return browser.url('/pages/html/track_viewability.html')
            .then(async () => {
                await browser.setViewportSize({
                    width: 480,
                    height: 600
                }, false)
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.pause(1500)

                let requests = await requestMock.getSeenRequests()
                expect(requests.length).to.equal(1)

                let request = requests[0]
                let queries = queryString.parse(request.url.split('?')[1])
                expect(queries.a).to.equal('viewable_impression')
                expect(queries.c).to.equal('ad')
            })
    })
})

describe('track media', () => {
    it('should be able to track media player', () => {
        return browser.url('/pages/html/track_media.html')
            .then(async () => {
                let requestMock = await mockServer.anyRequest().thenReply(200, '')
                await browser.click('#ad') // start video
                await browser.pause(4500)

                await browser.click('#ad') // pause video
                await browser.pause(1000)

                await browser.click('#ad') // re-start video
                await browser.pause(4000)

                let requests = await requestMock.getSeenRequests()
                expect(requests.length).to.equal(6)

                let q1 = queryString.parse(requests[0].url.split('?')[1])
                expect(q1.a).to.equal('play')
                expect(q1.c).to.equal('video')

                let q2 = queryString.parse(requests[1].url.split('?')[1])
                expect(q2.a).to.equal('playing')
                expect(q2.c).to.equal('video')

                let q3 = queryString.parse(requests[2].url.split('?')[1])
                expect(q3.a).to.equal('pause')
                expect(q3.c).to.equal('video')

                let q4 = queryString.parse(requests[3].url.split('?')[1])
                expect(q4.a).to.equal('play')
                expect(q4.c).to.equal('video')

                let q5 = queryString.parse(requests[4].url.split('?')[1])
                expect(q5.a).to.equal('playing')
                expect(q5.c).to.equal('video')

                let q6 = queryString.parse(requests[5].url.split('?')[1])
                expect(q6.a).to.equal('pause')
                expect(q6.c).to.equal('video')
            })
    })
})
