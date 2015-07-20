/*jshint esnext:true, mocha:true*/
'use strict'

const assert = require('assert')
    , nock = require('nock')
    , co = require('co')
    , sinon = require('sinon')
    , request = require('../')
    , Response = require('../interfaces/Response')
    , noop = function () {}

    , testBase = 'http://request.test.com'
    , testPath200Json = '/200json'
    , testUri200Json = testBase + testPath200Json
    , testPath504 = '/504'
    , testUri504 = testBase + testPath504
    , testServer = nock(testBase)
    , testResponse = {
        id: 0, name: 'xiaody'
    }

describe('request', function () {
    describe('200 JSON', function () {
        beforeEach(function () {
            testServer.get(testPath200Json).reply(200, testResponse)
        })

        let testUri = testUri200Json


        it('should return a promise', function () {
            let ret = request(testUri)
            assert((typeof ret.then) === 'function')
        })

        it('should resolve to a response', function (done) {
            co(function* () {
                let response = yield request(testUri)
                assert(response instanceof Response)
                done()
            });
        })

        it('should set response props', function (done) {
            co(function* () {
                let response = yield request(testUri)
                assert(response.ok === true)
                assert(response.status === 200)
                assert(response.url === testUri)
                done()
            });
        })

        describe('json', function () {
            it('should parse right', function (done) {
                co(function* () {
                    let response = yield request(testUri)
                    assert.deepEqual(yield response.json(), testResponse)
                    done()
                });
            })
        })

        describe('safeJson', function () {
            it('should parse right', function (done) {
                co(function* () {
                    let response = yield request(testUri)
                    assert.deepEqual(yield response.safeJson(), testResponse)
                    done()
                });
            })
        })

        describe('response clone', function () {
            it('should eval same', function (done) {
                co(function* () {
                    let response = yield request(testUri)
                    let clone = response.clone()
                    assert.deepEqual(yield response.json(), yield clone.json())
                    done()
                });
            })
        })
    })

    describe('504', function () {
        beforeEach(function () {
            testServer.get(testPath504).reply(504)
        })

        let testUri = testUri504


        it('should return a promise', function () {
            let ret = request(testUri)
            assert((typeof ret.then) === 'function')
        })

        it('should resolve to a response', function (done) {
            co(function* () {
                let response = yield request(testUri)
                assert(response instanceof Response)
                done()
            });
        })

        it('should set response props', function (done) {
            co(function* () {
                let response = yield request(testUri)
                assert(response.ok === false)
                assert(response.status === 504)
                assert(response.url === testUri)
                assert(response._error)
                assert(response._error.request)
                assert(response._error.response)
                done()
            });
        })

        describe('json', function () {
            it('should throw', function (done) {
                let successHandler = sinon.spy()
                let errorHandler = sinon.spy()
                co(function* () {
                    let response = yield request(testUri)
                    yield response.json().then(successHandler).catch(errorHandler)
                    assert(!successHandler.called)
                    assert(errorHandler.called)
                    done()
                });
            })
        })

        describe('safeJson', function () {
            it('should not throw', function (done) {
                let successHandler = sinon.spy()
                let errorHandler = sinon.spy()
                co(function* () {
                    let response = yield request(testUri)
                    yield response.safeJson().then(successHandler).catch(errorHandler)
                    assert(successHandler.called)
                    assert(!errorHandler.called)
                    done()
                });
            })
            it('should use second arg for fallback if it exists', function (done) {
                const fallback = {fall: 'back'}
                co(function* () {
                    let response = yield request(testUri)
                    assert((yield response.safeJson(noop, fallback)) === fallback)
                    done()
                });
            })
            describe('when only one arg is passed in', function () {
                it('should use handler return value as fallback', function (done) {
                    const fallback = {fall: 'back'}
                    co(function* () {
                        let response = yield request(testUri)
                        assert((yield response.safeJson(function () {return fallback})) === fallback)
                        done()
                    });
                })

                it('should return the error if handler returns undefined', function (done) {
                    const fallback = {fall: 'back'}
                    co(function* () {
                        let response = yield request(testUri)
                        assert((yield response.safeJson(noop)) instanceof Error)
                        done()
                    });
                })
            })
            describe('when no args is passed in', function () {
                it('should return the error', function (done) {
                    const fallback = {fall: 'back'}
                    co(function* () {
                        let response = yield request(testUri)
                        assert((yield response.safeJson()) instanceof Error)
                        done()
                    });
                })
            })
        })
    })

})
