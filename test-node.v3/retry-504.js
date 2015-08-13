/*jshint esnext:true, mocha:true*/
'use strict'

const assert = require('assert')
    , nock = require('nock')
    , co = require('co')
    , sinon = require('sinon')
    , request = require('../')
    , Response = require('../interfaces/Response')

    , testBase = 'http://request.test.com'
    , testPathBase = '/504-504-200-404.json.'
    , testServer = nock(testBase)
    , testResponse = {
        id: 0, name: 'xiaody'
    }

describe('request with retry', function () {

    describe('504 + 504 + 200 JSON', function () {
        let testIndex = 0
        beforeEach(function () {
            let path = testPathBase + testIndex
            testServer.get(path).times(2).reply(504)
            testServer.get(path).reply(200, testResponse)
            testServer.get(path).reply(404)
        })
        afterEach(function () {
            testIndex++
        })

        it('should fail w/o retry', function (done) {
            let testUri = testBase + testPathBase + testIndex
            co(function* () {
                let response = yield request(testUri)
                assert(response.ok === false)
                done()
            });
        })

        it('should fail with 1 retry', function (done) {
            let testUri = testBase + testPathBase + testIndex
            co(function* () {
                let response = yield request({
                    uri: testUri
                    , retry: 1
                })
                assert(response.ok === false)
                done()
            });
        })

        it('should success with 2 retries', function (done) {
            let testUri = testBase + testPathBase + testIndex
            co(function* () {
                let response = yield request({
                    uri: testUri
                    , retry: 2
                })
                assert(response.ok === true)
                assert.deepEqual(yield response.json(), testResponse)
                done()
            });
        })

        it('should success with 3 retries', function (done) {
            let testUri = testBase + testPathBase + testIndex
            co(function* () {
                let response = yield request({
                    uri: testUri
                    , retry: 3
                })
                assert(response.ok === true)
                assert.deepEqual(yield response.json(), testResponse)
                done()
            });
        })
    })
})
