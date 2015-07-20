/*jshint esnext:false, unused:true*/
'use strict'
var url = require('url')
    , qs = require('qs')
    , retryDefaults = {
        retries: 0,
        minTimeout: 300,
        maxTimeout: 500,
    }

module.exports = function normalizeOpt (requestObj) {
    // normalize requestObj to object
    if (typeof requestObj === 'string') {
        requestObj = {
            uri: requestObj
        }
    } else {
        // .uri is the standard key
        requestObj.uri = requestObj.uri || requestObj.url
    }

    // parse .retry option
    var retryOpt = retryDefaults
    if (requestObj.retry) {
        switch (typeof requestObj.retry) {
        case 'number':
            retryOpt = Object.create(retryDefaults)
            retryOpt.retries = requestObj.retry
            break
        case 'Object':
            retryOpt = requestObj.retry
        }
    }

    // parse .form or .qs option
    var postBody = null
    if (requestObj.body)
        postBody = requestObj.body
    else if (requestObj.form)
        postBody = qs.stringify(requestObj.form)
    var search = url.parse(requestObj.uri).search
    var qsString = ''
    if (requestObj.qs)
        qsString = (search ? '&' : '?') + qs.stringify(requestObj.qs)

    return {
        uri: requestObj.uri + qsString
        , method: (requestObj.method || 'GET').toUpperCase()
        , headers: requestObj.headers || {}
        , body: postBody
        , timeout: requestObj.timeout || 0
        , keepAlive: requestObj.keepAlive
        , retry: retryOpt
        , displayName: requestObj.displayName || requestObj.uri
        , label: requestObj.label
    }

}
