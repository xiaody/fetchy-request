/*jshint esnext:false, mocha:true*/
'use strict'

global.Promise = global.Promise || require('bluebird')
var assert = require('assert')
    , nock = require('nock')
    , sinon = require('sinon')
    , request = require('../')
    , Response = require('../interfaces/Response')

    , testBase = 'http://request.test.com'
    , testPath = '/200json'
    , testUri = testBase + testPath
    , testServer = nock(testBase)
    , testResponse = {
        id: 0, name: 'xiaody'
    }, testHeaders = {
        'X-powered-by': 'node nock'
    }

describe('request response', function () {
    beforeEach(function () {
        testServer.get(testPath).reply(200, testResponse, testHeaders)
    })

    it('should have correct headers', function (done) {
        request(testUri).then(function (response) {
            assert(response.headers)
            assert(response.headers.has('x-powered-by'))
            assert(response.headers.has('X-PoweRed-By'))
            assert(response.headers.get('x-powered-by'), 'node nock')
            assert(response.headers.get('x-poWeRed-bY'), 'node nock')
            assert.deepEqual(response.headers.getAll('x-powered-by'), ['node nock'])
            done()
        });
    })
})
