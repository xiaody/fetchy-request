/*jshint esnext:false, unused:true, supernew:true*/
'use strict'
var util = require('util')
    , stream = require('stream')
    , Headers = require('./Headers')
    , Body = require('./_Body')

/**
 * @constructor
 */
function Response (res) {
    Body.call(this, (res instanceof stream) ? res.pipe(new stream.PassThrough()) : res)

    this.ok = !!(res.statusCode && res.statusCode >= 200 && res.statusCode <= 299)
    this.status = res.statusCode || 0
    this.statusText = res.statusMessage || ''
    this.type = 'default'
    this.url = res.uri || null
    this.headers = new Headers(res.headers)

    this._raw = res
    this._error = res._error || null
    // XXX add timing info here?
}

util.inherits(Response, Body)

Response.prototype.clone = function () {
    if (this.bodyUsed)
        return Promise.reject(new TypeError('Response body is already consumed.'))
    return new Response(this._raw)
}


module.exports = Response
