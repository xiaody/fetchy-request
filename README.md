[![Build Status](https://travis-ci.org/xiaody/fetchy-request.svg)](https://travis-ci.org/xiaody/fetchy-request)

A simple way to make simple http requests.

## Install

```bash
npm install --save fetchy-request
## Notice: if you are using a legacy node version
## which does not contain a native Promise,
## please install and use a polyfill by yourself.
# npm install --save bluebird
```

## Usage
**In general, the API is pretty much a mixture of the [fetch API] and the popular [request] package.**

A simple GET:

```javascript
let request = require('fetchy-request')

request('http://open.meituan.com/cool-api/?k1=v1&k2=v2')
    .then(function (response) {
        return response.json()
    }).then(function (json) {
        console.log('parsed json', json)
    })
```

The same GET <sup>[1]</sup>:

```javascript
let request = require('fetchy-request')

request({
    uri: 'http://open.meituan.com/cool-api/'
    method: 'GET',
    qs: {
        k1: 'v1',
        k2: 'v2'
    }
})
```

A simple POST:

```javascript
let request = require('fetchy-request')

request({
    uri: 'http://open.meituan.com/cool-api/'
    method: 'POST',
    form: {
        username: 'admin',
        password: 'hackmeifyoucan!'
    }
})
```

Another POST:

```javascript
let request = require('fetchy-request')

request({
    uri: 'http://open.meituan.com/cool-api/'
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: '{"json is": "Great!"}'
})
```

`qs` and `form` is stringified by [qs];
POST `body` overwrites `form`.

File uploads are not yet supported.

## Timeout

Set *response* timeout in millisecond.

```javascript
let request = require('fetchy-request')

request({
        uri: 'http://open.meituan.com/cool-api/?k1=v1&k2=v2'
        timeout: 2000
    })
```

## Retry

Retry for any http 5xx server errors or local syscall errors:

```javascript
let request = require('fetchy-request')

request({
        uri: 'http://open.meituan.com/cool-api/?k1=v1&k2=v2'
        retry: 2
    })
```

## Proxy
Automatically use `process.env.HTTP_PROXY` for http requests.

```bash
HTTP_PROXY='http://127.0.0.1:8888' node server.js
```

**Notice: this is purposely designed for debugging. DO NOT use in production environments.**

## Events/Timing/Error Reporting

```javascript
let request = require('fetchy-request')
request({
    uri: 'http://open.meituan.com/poi/12345?k1=v1&k2=v2',
    // .displayName will be used in errors' message,
    // default to the `.uri` if omitted
    displayName: 'open.meituan.com/poi',
    // label is readable in any events callback
    label: ['tag1', 'tag2']
})

request.on('beforeSend', function (requestOptions) {
})

request.on('success', function (incommingMsg, requestOptions) {
    console.log(requestOptions.displayName, 'timing:', incommingMsg.timing.response - incommingMsg.timing.start)
    // => open.meituan.com/poi timing: 200
    console.log(requestOptions.label)
    // => ['tag1', 'tag2']
})

request.on('failure', function (error, requestOptions) {
    console.warn(error.message)
    // => 502 Bad Gateway: open.meituan.com/poi
    console.log(requestOptions.displayName, 'request failed after', err.timing.error - err.timing.start, 'ms')
    // => open.meituan.com/poi request failed after 300 ms
    console.log(requestOptions.label)
    // => ['tag1', 'tag2']
})
```

## Error Handling Sugar

```javascript
let request = require('fetchy-request')

request('http://unstable.meituan.com/user.xml?user=xiaody')
    .then(function (response) {
        const fallback = { user: '', phone: '', error: true }

        // request failed
        if (!response.ok)
            return fallback

        // in case its not JSON
        return response.safeJson(function (e) {
            send_error_msg('error occurs when parse response as JSON:', e)
            return fallback
            // the error `e` will be returned if this error handler is omitted;
            // you can also pass in the fallback as a second argument, which overwrite the return value of the error handler.
        })
    }).then(function (userInfoOrFallback) {
        // use userInfo or fallback
    })
```

_
[1] In fact, there is a little difference when they come to error reporting.
_


[fetch api]: https://fetch.spec.whatwg.org/#fetch-api
[request]: https://www.npmjs.com/package/request
[qs]: https://www.npmjs.com/package/qs
[querystring]: https://iojs.org/api/querystring.html
