/*jshint esnext:true, mocha:true*/
'use strict'

const assert = require('assert')
    , nock = require('nock')
    , co = require('co')
    , sinon = require('sinon')
    , request = require('../')
    , Response = require('../interfaces/Response')

    , testBase = 'http://request.test.com'
    , testPath = '/timeout'
    , testUri = testBase + testPath
    , testDelay = 2000
    , testServer = nock(testBase)

describe('request timeout', function () {
    // use longer mocha timeout
    this.timeout(5000)

    beforeEach(function () {
        testServer.get(testPath).delayConnection(testDelay).reply(204)
    })

    it('should success w/o timeout', function (done) {
        co(function* () {
            let response = yield request({
                uri: testUri
            })
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

    it('should success with long timeout', function (done) {
        co(function* () {
            let response = yield request({
                uri: testUri
                , timeout: 3000
            })
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

    it('should abort with short timeout', function (done) {
        co(function* () {
            let response = yield request({
                uri: testUri
                , timeout: 1000
            })
            assert(response.ok === false)
            done()
        });
    })

    it('should success with short timeout plus retries', function (done) {
        testServer.get(testPath).reply(204)
        co(function* () {
            let response = yield request({
                uri: testUri
                , timeout: 1000
                , retry: 1
            })
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

})
