/*jshint esnext:false, unused:true, supernew:true*/
'use strict'

var retry = require('retry')
    , normalizeOpt = require('./request-option')
    , _request = require('./simple-request')
    , Response = require('./interfaces/Response')
    , _EventEmitter = require('event-emitter')


var eeRequest = _EventEmitter(request)
module.exports = eeRequest


/**
 * @param {Object|String} requestObj
 * @return {Promise}
 */
function request (requestObj) {
    var requestOpt = normalizeOpt(requestObj)

    var isSafeMethod = (requestOpt.method === 'GET' || requestOpt.method === 'HEAD')
    var operation = retry.operation(requestOpt.retry)
    var throwError = requestObj.error === 'throw'

    return new Promise(function (resolve, reject) {
        eeRequest.emit('beforeSend', requestOpt)
        operation.attempt(function () {
            _request(requestOpt).then(function (res) {
                res.uri = res.uri || requestOpt.uri
                var err
                if (isHttpServerError(res)) {
                    err = new Error(res.statusCode + ' ' + res.statusMessage + ': ' + requestOpt.displayName)
                    err.response = res
                }
                if (isSafeMethod && operation.retry(err))
                    return
                if (isHttpClientError(res)) {
                    err = new Error(res.statusCode + ' ' + res.statusMessage + ': ' + requestOpt.displayName)
                    err.response = res
                }
                if (err) {
                    err = operation.mainError() || err
                    throw err
                } else {
                    eeRequest.emit('success', res, requestOpt)
                    resolve(new Response(res))
                }
            }).catch(function (e) {
                // only retry for syserror here; httperror has been retried in executor
                if (isSyscallError(e) && operation.retry(e))
                    return

                var err = operation.mainError() || e
                err.request = requestOpt
                eeRequest.emit('failure', err, requestOpt)

                if (throwError) {
                    reject(err)
                } else {
                    var errRes = err.response || {}
                    resolve(new Response({
                        headers: errRes.headers || {}
                        , statusCode: errRes.statusCode || 0
                        , statusMessage: errRes.statusMessage || ''
                        , uri: errRes.uri
                        , _error: err
                    }))
                }
            })
        })
    })
}

function isHttpClientError (res) {
    var code = res.statusCode || 0
    return code >= 400 && code <= 499
}

function isHttpServerError (res) {
    var code = res.statusCode || 0
    return code >= 500 && code <= 599
}

function isSyscallError (error) {
    // DNS resolution errors, TCP level errors, or actual HTTP parse errors
    return !error.statusCode && error.syscall
}
