## Server-side usage:

    $ export PORT=1234          # HTTP port the server listens (optional, default:5000)
    $ export APIKEY=secretkey   # Key required to use the REST API (optional, default:undefined)
    $ export MAXWORKERS=5       # Maximum number of child processes the REST api uses to process
                                # screenshots (optional, default:5)
    $ nodejs webcap-server.js   # Start the REST API server

## Client-side usage. Common to both API's:

    HTTP POST http://example.com:1234/webcap
    Body: json
    
`json` JSON-encoded parameters (key:value). Available parameters are the same as in the command line tool + a few additional (read on). If timeout is not specified, it is set to 30 seconds. Minimum is 2 seconds.

`opts.key` `str` — The key specified when starting the server.  

## Synchronous API:

1. Client sends a request to the Webcap REST API.
2. Server produces the screenshot (this takes many seconds). Note that only `opts.urls[0].url` is used.
3. Server sends a response to the client.

Server response is in [JSend] format.

If `'success'` then `'data'` is json — Available data is the same as in the command line tool.  
If `'error'` then `'message'` is str — Detailing error.

## Asynchronous API:

1. Client sends a request to the Webcap REST API.
2. Server queues each `opts.urls` (job) for processing to workers and responds to the client.
3. Server does HTTP POST for each processed `opts.urls`, containing it's result.

Additional parameters:

`opts.callbackUrl` `str` — URL to which the results will be posted.  
`urls[n].callbackData` `str` — Data conveyed with callback for the URL.

Server response is in [JSend] format.

If `response.status == 'success'` then `response.data` is `str` — Details successful queuing.  
If `response.status == 'error'` then `response.message` is `str` — Detailing error.

Callback body is in [JSend] format.

If `response.status == 'success'` then `response.data` is `json` — Same response as command line tool.  
If `response.status == 'success'` then `response.callbackData` — Specified in this URL's `callbackData`.  
If `response.status == 'error'` then `response.message` is `str` — Detailing error.


## Please note:

The `opts.timeout` doesn't guarantee a response within that time, as it only specified how long the `webcap.js` process is allowed to run on the server. Each URL queued for screenshotting might take some time to be taken up for processing.

Remember to set your HTTP client's timeout when using the Synchronous API.

If hosting the REST API on Heroku, the hosting architecture expects a reply to be sent within 30 seconds. Thus it is advisable to cap the timeout to a value under 30 seconds, so as to receive a proper response from Webcap, and not an error from Heroku. 

## Examples:

See [`browser-example.js`][examples] for a Javascript example runnable inside a web browser.

Simulate HTTP Post using [cURL][curl] and display the resulting screenshot with [ImageMagick][imagemagick]:  

    $ curl -v -d '{"urls":[{"url":"http://fox.com"}]}' 'http://example.com:5000/webcap' | grep -oP '(?<="image":").*?(?=")' | base64 -d | display png:-

  [curl]: http://curl.haxx.se/
  [imagemagick]: http://www.imagemagick.org
  [examples]: https://bitbucket.org/gima/webcap/src/master/documentation/browser-example.js
  [jsend]: http://labs.omniti.com/labs/jsend
