/*jshint esnext:false, unused:true, supernew:true*/
'use strict'
var stream = require('stream')

function Body (body) {
    this.body = body || null
    this.bodyUsed = false
}

Body.prototype = {
    constructor: Body,

    _consume: function () {
        var self = this

        if (this.bodyUsed === true)
            return Promise.reject(new TypeError('Body is already consumed.'))
        this.bodyUsed = true

        return new Promise(function (resolve, reject) {
            if (self.body === null) {
                return resolve((self.body = ''))
            } else if (typeof self.body === 'string') {
                return resolve(self.body)
            } else if (self.body instanceof stream) {
                var _raw = []
                self.body.on('data', function (chunk) {
                    _raw.push(chunk)
                })
                self.body.on('end', function () {
                    resolve(Buffer.concat(_raw))
                })
                self.body.on('error', function (e) {
                    reject(e)
                })
            } else {
                resolve('')
            }
        })
    },

    text: function () {
        return this._consume().then(function (buf) {
            return buf.toString('utf8')
        })
    },

    json: function () {
        return this.text().then(JSON.parse)
    },

    safeJson: function (errHandler, fallback) {
        var self = this
        var hasFallback = arguments.length > 1
        var ret
        return this.json().catch(function (e) {
            switch (typeof errHandler) {
            case 'function':
                ret = errHandler.call(self, e)
                break
            default:
                console.warn(errHandler || e.message)
            }

            if (hasFallback)
                return fallback
            else if (typeof ret !== 'undefined')
                return ret
            else
                return e
        })
    }

}

module.exports = Body
