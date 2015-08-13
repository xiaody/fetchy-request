/*jshint esnext:true, mocha:true*/
'use strict'

const assert = require('assert')
    , normalizeOpt = require('../request-option')

describe('request option', function () {
    const uri = 'http://meituan.com/test'
        , query = { k1: 'v1', k2: 'v2' }
        , uriWithQuery = 'http://meituan.com/test?k1=v1&k2=v2'

    describe('result', function () {
        it('should have all the allowed keys', function () {
            const keys = 'uri,method,headers,body,timeout,retry,displayName,label,keepAlive'.split(',')
            assert.deepEqual(
                keys.sort(),
                Object.keys(normalizeOpt(uri)).sort()
            )
        })
    })

    it('should normalize method', function () {
        assert(normalizeOpt(uri).method === 'GET')
        assert(normalizeOpt({
            uri: uri
        }).method === 'GET')
        assert(normalizeOpt({
            uri: uri,
            method: 'get'
        }).method === 'GET')
        assert(normalizeOpt({
            uri: uri,
            method: 'post'
        }).method === 'POST')
    })

    it('should normalize uri', function () {
        assert(normalizeOpt(uri).uri === uri)
        assert(normalizeOpt({
            url: uri
        }).uri === uri)
        assert(normalizeOpt({
            uri: uri,
            qs: query
        }).uri === uriWithQuery)
    })

    it('should normalize body', function () {
        assert(normalizeOpt({
            uri: uri,
            method: 'post',
            form: query
        }).body === 'k1=v1&k2=v2')
        assert(normalizeOpt({
            uri: uri,
            method: 'post',
            body: JSON.stringify(query)
        }).body === JSON.stringify(query))
    })
})
