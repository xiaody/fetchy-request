/*jshint esnext:false, mocha:true*/
'use strict'

global.Promise = global.Promise || require('bluebird')
var assert = require('assert')
    , nock = require('nock')
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
        request({
            uri: testUri
        }).then(function (response) {
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

    it('should success with long timeout', function (done) {
        request({
            uri: testUri
            , timeout: 3000
        }).then(function (response) {
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

    it('should abort with short timeout', function (done) {
        request({
            uri: testUri
            , timeout: 1000
        }).then(function (response) {
            assert(response.ok === false)
            done()
        });
    })

    it('should success with short timeout plus retries', function (done) {
        testServer.get(testPath).reply(204)
        request({
            uri: testUri
            , timeout: 1000
            , retry: 1
        }).then(function (response) {
            assert(response.ok === true)
            assert(response.status === 204)
            done()
        });
    })

})
