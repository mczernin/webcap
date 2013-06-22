### Usage (Server Side):

    $ export PORT=1234              // set the HTTP port that the server listens
    $ export KEY=secretkey          // set the key necessary to use the REST API
    $ nodejs src/webcap-server.js     // start the REST API server

### Usage (Client Side):

    HTTP POST http://example.com/webcap
    Body: <json>
    
`<json>` JSON-encoded parameters (key:value). Available parameters are the same as in the command line tool. Except this REST API accepts one additional parameter:

`"KEY"` (str) — The key specified when starting the server.

### HTTP Response Code:

`200` – Success. Response header Content-Type: application/json. Body is JSON-encoded (key:value). Available data is the same as in the command line tool.

`?` – Any other code means an error occurred. Details available in the response body.

### Please note:

The response may take up to `"timeout"` seconds. Remember to set your HTTP client's timeout accordingly.

If hosting the REST API on Heroku, the hosting architecture expects the reply to be sent within 30 seconds. Thus it is advisable to cap the `"timeout"` to a value under 30 seconds, so as to receive a proper response from Webcap, and not an error from Heroku.
