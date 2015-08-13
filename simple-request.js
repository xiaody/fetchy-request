/**
 * A thin promise wrapper around the
 * native http.request API. Supports
 * `GET` and simple `POST` requests.
 */

/*jshint esnext:false, unused:true, supernew:true, camelcase:false*/
'use strict'

var http = require('http')
    , https = require('https')
    , url = require('url')
    , http_proxy = process.env.http_proxy || process.env.HTTP_PROXY
    , httpProxyAgent = require('http-proxy-agent')
    , now = Date.now

/**
 * @param {Object|String}
 * @return {Promise} resolve to the http.IncomingMessage instance
 */
function _request (options) {
    if (typeof options === 'string')
        options = {
            uri: options
        }

    var uri = options.uri
        , method = (options.method || 'GET').toUpperCase()
        , headers = options.headers
        , postBody = options.body
        , keepAlive = options.keepAlive
        , timeout = options.timeout

    var uriParsed = url.parse(uri)
    var isHttps = uriParsed.protocol === 'https:'
    var request = isHttps ? https.request : http.request

    var opts = {
        hostname: uriParsed.hostname
        , port: uriParsed.port || (isHttps ? 443 : 80)
        , path: uriParsed.path
        , method: method
        , headers: headers || {}
    }
    if (opts.method === 'POST' && postBody) {
        opts.headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded'
        opts.headers['Content-Length'] = Buffer.byteLength(postBody)
    }
    if (keepAlive) {
        opts.headers['Connection'] = 'keep-alive'
    }

    // handle http proxy
    // TODO handle all proxy envs and allow a .proxy config passed in
    if (http_proxy && uriParsed.protocol === 'http:') {
        opts.agent = httpProxyAgent(http_proxy)
    }

    return new Promise(function (resolve, reject) {
        var timing = { start:now(), socket:0, connect:0, response:0, abort:0, error:0 }
        var req = request(opts)
        req.setNoDelay(true)
        req.on('error', function (e) {
            timing.error = now()
            e.timing = timing
            reject(e)
        })
        req.on('socket', function (socket) {
            timing.socket = now()
            socket.on('connect', function () {
                timing.connect = now()
            })
        })
        req.on('response', function (res) {
            timing.response = now()
            res.timing = timing
            resolve(res)
        })
        
        if (opts.method === 'POST' && postBody) {
            req.write(postBody)
        }
        req.end()

        if (timeout) {
            setTimeout(function () {
                var e = new Error('socket timed out: ' + uriParsed.hostname)
                timing.abort = now()
                e.timing = timing
                e.code = 'ESOCKETTIMEDOUT'
                e.errno = 'ESOCKETTIMEDOUT'
                e.syscall = 'socket_'
                reject(e)
                req.abort()
            }, timeout)
        }

    })
}

module.exports = _request
