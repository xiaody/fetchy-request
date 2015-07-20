/*jshint esnext:false, mocha:true*/
'use strict'

global.Promise = global.Promise || require('bluebird')
var assert = require('assert')
    , nock = require('nock')
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
        var testIndex = 0
        beforeEach(function () {
            var path = testPathBase + testIndex
            testServer.get(path).times(2).reply(504)
            testServer.get(path).reply(200, testResponse)
            testServer.get(path).reply(404)
        })
        afterEach(function () {
            testIndex++
        })

        it('should fail w/o retry', function (done) {
            var testUri = testBase + testPathBase + testIndex
            request(testUri).then(function (response) {
                assert(response.ok === false)
                done()
            });
        })

        it('should fail with 1 retry', function (done) {
            var testUri = testBase + testPathBase + testIndex
            request({
                uri: testUri
                , retry: 1
            }).then(function (response) {
                assert(response.ok === false)
                done()
            });
        })

        it('should success with 2 retries', function (done) {
            var testUri = testBase + testPathBase + testIndex
            request({
                uri: testUri
                , retry: 2
            }).then(function (response) {
                assert(response.ok === true)
                return response.json()
            }).then(function (json) {
                assert.deepEqual(json, testResponse)
                done()
            });
        })

        it('should success with 3 retries', function (done) {
            var testUri = testBase + testPathBase + testIndex
            request({
                uri: testUri
                , retry: 3
            }).then(function (response) {
                assert(response.ok === true)
                return response.json()
            }).then(function (json) {
                assert.deepEqual(json, testResponse)
                done()
            })
        })
    })
})
