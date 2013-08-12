### Usage (Server Side):

    $ export PORT=1234          # HTTP port the server listens (optional, default:5000)
    $ export APIKEY=secretkey   # Key required to use the REST API (optional, default:undefined)
    $ export MAXWORKERS=5       # Maximum number of child processes the REST api uses to process
                                # screenshots (optional, default:5)
    $ nodejs webcap-server.js   # Start the REST API server

### Usage (Client Side):

    HTTP POST http://example.com:1234/webcap
    Body: json
    
`json` JSON-encoded parameters (key:value). Available parameters are the same as in the command line tool, except this REST API accepts a few additional parameters:

`opts.key` `str` — The key specified when starting the server.  
`opts.callbackUrl` `str` — (Async API) URL to which the result will be HTTP POSTed.  
`urls[n].callbackData` `str` — (Async API, optional) Data conveyed with the result.

If timeout is not specified, it is set to 30 seconds. Minimum is 2 seconds.

### HTTP Response and Asynchronous API Callback:

Header `Content-Type` is `application/json`.

### HTTP Response / Synchronous API:

Success:
>     {
>         status:'success',
>         data:str      // JSON. Available data is the same as in the command line tool.
>     }

Failure:
>     {
>         status:'error',
>         message:str   // String that details the error.
>     }

### HTTP Response / Asynchronous API:

Success:
>     {
>         status:'success',
>         data:str      // Details how many URLs were queued.
>     }

Failure:
>     {
>         status:'error',
>         message:str   // String that details the error.
>     }

### HTTP Callback / Asynchronous API:

Success:
>     {
>         status:'success',
>         data:str        // JSON. Available data is the same as in the command line tool.
>         callbackData:?  // Data specified to be conveyed during the request.
>     }

Failure:
>     {
>         status:'error',
>         message:str   // String that details the error.
>     }


### Please note:

The `opts.timeout` value only specified how long the `webcap.js` process is allowed to run on the server. It doesn't guarantee a response within that time, as queued URLs can take a long time to be taken up up for processing.

When using the Sync. API, remember to set your HTTP client's timeout accordingly.

If hosting the REST API on Heroku, the hosting architecture expects a reply to be sent within 30 seconds. Thus it is advisable to cap the timeout to a value under 30 seconds, so as to receive a proper response from Webcap, and not an error from Heroku. 

### Examples:

See [`browser-example.js`][examples] for a Javascript example runnable inside a web browser.

Simulate HTTP Post using [cURL][curl] and display the resulting screenshot with [ImageMagick][imagemagick]:  

    $ curl -v -d '{"url":"http://fox.com"}' 'http://example.com:5000/webcap' | grep -oP '(?<="image":").*?(?=")' | base64 -d | display png:-

  [curl]: http://curl.haxx.se/
  [imagemagick]: http://www.imagemagick.org
  [examples]: https://bitbucket.org/gima/webcap/src/master/documentation/browser-example.js
  [jsend]: http://labs.omniti.com/labs/jsend
