### Usage (Server Side):

    $ export PORT=1234          // set the HTTP port that the server listens
                                // (can be left undefined, default:5000)
    $ export KEY=secretkey      // set the key necessary to use the REST API
                                // (can be left undefined)
    $ nodejs webcap-server.js     // start the REST API server

### Usage (Client Side):

    HTTP POST http://example.com/webcap
    Body: json
    
`json` JSON-encoded parameters (key:value). Available parameters are the same as in the command line tool, except the REST API accepts one additional parameter:

`"key"` (str) — The key specified when starting the server.

### HTTP Response Code:

`200` – Success. Response header Content-Type: application/json. Body is JSON-encoded (key:value). Available data is the same as in the command line tool.

`?` – Any other code means an error occurred. Details available in the response body.

### Please note:

The response may take up to `"timeout"` seconds. Remember to set your HTTP client's timeout accordingly. If timeout is not specified, it is set to 28 seconds.

If hosting the REST API on Heroku, the hosting architecture expects a reply to be sent within 30 seconds. Thus it is advisable to cap the timeout to a value under 30 seconds, so as to receive a proper response from Webcap, and not an error from Heroku. 

### Examples:

See [`browser-example.js`](https://bitbucket.org/gima/webcap/src/master/documentation/browser-example.js) for a Javascript example runnable inside  a web browser.

Simulate HTTP Post using [cURL][curl] and display the resulting screenshot with [ImageMagick][imagemagick]:  
(This example was adapted from Webcap command line documentation examples.)

    $ curl -v -d '{"url":"http://fox.com"}' 'http://example.com:5000/webcap' | grep -oP '(?<="image":").*?(?=")' | base64 -d | display png:-

  [curl]: http://curl.haxx.se/
  [imagemagick]: http://www.imagemagick.org
