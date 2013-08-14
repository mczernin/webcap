## Description	

Take screenshots of web pages. Provides a command line tool and a HTTP API supporting both synchronous and asynchronous requests. The project is ready to run on a free [Heroku] dyno.

The HTTP API is a HTTP server which runs on [NodeJS] and uses child processes to take the actual screenshots. Each child process is an instance of the command line tool, which runs on [PhantomJS].

  [NodeJS]: http://nodejs.org
  [PhantomJS]: http://phantomjs.org

## Table of Content

| Section | Description |
| - | - |
| 1. [Command line tool](#command-line-tool) | How to use the command line tool |
| 2. [HTTP API server](#http-api-server) | How to start the server |
| 3. [HTTP API](#http-api) | How to use the HTTP API |
| 4. [Request Parameters](#request-parameters) | What parameters the APIs accept |
| 5. [Returned Data](#returned-data) | What command line tool returns |
| 6. [Examples](#examples) | Examples |
| 7. [Heroku](#heroku) | How to run the HTTP API on Heroku |
| 8. [License](#license) | UNLICENSE.txt (Public Domain) |

## 1. Command line tool

```no-highlight
$ phantomjs webcap.js <json>
```

`json` – See "[Request Parameters](#request-parameters)".

Exit code:  
`0` – Screenshot successful. JSON written to stdout. See "[Returned Data](#returned-data)".  
`?` – Any other exit code means an error occurred. Details written to stdout & stderr.

*(!) From the creator of [NPM] comes an easy way to install [NodeJS] onto a server without root access: [nave]. Just update your PATH to include the installation directory.*

  [NPM]: https://npmjs.org
  [nave]: https://npmjs.org/package/nave

## 2. HTTP API Server

The server must be started for it to be able to accept requests.

```bash
# HTTP port the server listens (optional, default:5000)
$ export PORT=1234

# Key required to use the HTTP API (optional, default:undefined)
$ export APIKEY=secretkey

# Maximum number of child processes the HTTP API uses to process screenshots (optional, default:5)
$ export MAXWORKERS=5

# Start the REST API server
$ nodejs webcap-server.js
```

## 3. HTTP API

```no-highlight
HTTP POST <json> to server URL http://example.com:5000/webcap
The "/webcap" part of the URL doesn't change.
```

`json` – See "[Request Parameters](#request-parameters)".

*(!) If timeout is not specified, it is set to 30 seconds. Minimum is 2 seconds.*

*(!!) The timeout doesn't guarantee a response within that time, as it only specified how long the command line child process taking the actual screenshot is allowed to run on the server. Also each URL queued for screenshotting will take some time before being taken up for processing.*

*(!!!) Remember to set your HTTP client's timeout when using the Synchronous API.*

All responses are in JSON. Let `r` be the JSON-decoded response object.

### Synchronous HTTP API

--\> HTTP client sends a request to the HTTP API.  
\*Server produces the screenshot (this takes many seconds)\*  
<-- Server sends a response to the client:

> If `'success'` then `r.data` is `json` — See "[Returned Data](#returned-data)".  
> If `'error'` then `r.message` is str — Detailing error.

(!) Note that only `opts.urls[0].url` is used.  

### Asynchronous HTTP API

--\> Client sends a request to the HTTP API.  
<-- Server queues each `opts.urls` for later processing and responds to the client.:

> If `'success'` then `r.data` is `str` — Informing of successful queuing.  
> If `'error'` then `r.message` is `str` — Detailing error.

<-- Server responds by doing one HTTP POST for each screenshotted URL:

> If `'success'` then `r.data` is `json` — See "[Returned Data](#returned-data)".  
> If `'success'` then `r.callbackData` — Specified in this URL's `callbackData`.  
> If `'error'` then `r.message` is `str` — Detailing error.

## 4. Request Parameters

Example:

```javascript
{
    urls: [
        { 'url': 'http://fox.com' }
    ],
    opts: {
        key: 'super secret key',
        viewportWidth: 1920,
        viewportHeight: 1080,
        clipWidth: 960,
        clipHeight: 540,
        zoom: 0.5,
        userAgent: 'Mozilla/4.41 (BEOS; U ;Nav)'
    }
}
```

Top level object:

| Key | Type | Default | Description |
| - | - |
| `urls` | `array` | | URLs to screenshot. See below. (**`urls[0]` is Mandatory**). |
| `opts` | `object` | | Options. See below. |

opts.callbackUrl 	str 	Server HTTP POSTs results to this URL.
urls[n].callbackData 	str 	Data conveyed during callback for this URL.

URL object:

| Key | Type | Default | Description |
| - | - |
| `url` | `str` | | URL to screenshot. **Mandatory**. |
| `callbackData` | `str` | | (**Async HTTP API**) Data conveyed during callback for this URL. |

Options object:

| Key | Type | Default | Description |
| - | - |
| `key` | `str` | | (**HTTP API**) The key specified when starting the server. If no key was specified, leave this undefined. |
| `callbackUrl` | `str` | | (**Async HTTP API**) Server HTTP POSTs results to this URL. |
| `viewportWidth` | `int` | 1024 | Width of the viewport of the virtual browser. |
| `viewportHeight` | `int` | 768 | Height of the viewport of the virtual browser. |
| `clipWidth` | `int` | viewportWidth | Width of resulting screenshot. |
| `clipHeight` | `int` | viewportHeight | Height of resulting screenshot. |
| `zoom` | `number` | 1.0 (range:0..1) | Viewport zoom factor. |
| `timeout` | `int` | 28 | Maximum time in seconds this PhantomJS script is allowed to execute. |
| `userAgent` | `str` | PhantomJS's default | User agent to identify self with during screenshot HTTP requests. |
| `javascript` | `bool` | true | Is Javascript enabled? |
| `maxBytes` | `int` | 5242280 or 5MB | Maximum allowed total received bytes. |
| `maxRedirects` | `int` | 40 | Maximum allowed total redirections. |
| `cookies` | `array` | [] | Cookies available to servers during the screenshot. See below. |

Cookie object:

| Key | Type | Default | Description |
| - | - |
| `name` | `str` | | Cookie name. **Mandatory**. |
| `value` | `str` | | Cookie data. **Mandatory**. |
| `domain` | `str` | | Cookie sent during request to this domain. **Mandatory**. |
| `path` | `str` | | Cookie sent during request to this path. |
| `httpOnly` | `bool` | false | Is cookie available outside HTTP (to Javascript). |
| `secure` | `bool` | false | Send cookie only if using secure protocol. |

## 5. Returned Data

Example:

```javascript
{
    opts: {
        viewportWidth: 1024,
        viewportHeight: 768,
        /*snip*/
        maxRedirects: 40
    },
    url: 'about:blank',
    headers: {
        /*snip*/
        Content-Length: '1292'
    },
    /*snip*/
    body: '<html><head></head><body></body></html>',
    image: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAACJJREFUaIHtwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAPBmMDAAAZIhw5EAAAAASUVORK5CYII='
}
```

Top level object:

| Key | Type | Description |
| - | - |
| `opts` | `object` | Options used during request (except `cookies` is omitted. See "[Request Parameters](#request-parameters)". |
| `url` | `str` | URL of the screenshotted web page. |
| `title` | `str` | Title of the screenshotted web page. |
| `headers` | `object` | Headers received from the server ({key:value}*n). |
| `bytesReceived` | `int` | Total bytes received (all requests & subrequest combined). |
| `redirected` | `int` | Redirect count of main request. |
| `body` | `str` | Body text of the web page after browser engine has interpreted it. Note: Javascript might have done modifications to it as well. NOTE: The value will ONLY be set if response MIME type matches text/html, application/xhtml+xml, application/xml or text/plain. |
| `image` | `str` | The actual screenshot in PNG format, encoded in Base64. |

## 6. Examples
Debug (spits everything at your face):  
`$ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}]}'`

Display screenshot using [ImageMagick][imagemagick]:

    $ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}]}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-

Using many parameters, screenshotted website displayed with ImageMagick:

    $ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}],"opts":{"viewportWidth":128,"viewportHeight":128,"zoom":0.1,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0"}}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-

See [`browser-example.js`][browserexample] for a Javascript example runnable inside a web browser.

Simulate HTTP Post using [cURL][curl] and display the resulting screenshot with [ImageMagick][imagemagick]:  

    $ curl -v -d '{"urls":[{"url":"http://fox.com"}]}' 'http://example.com:5000/webcap' | grep -oP '(?<="image":").*?(?=")' | base64 -d | display png:-

  [imagemagick]: http://www.imagemagick.org
  [curl]: http://curl.haxx.se/
  [browserexample]: /gima/webcap/blob/master/documentation/browser-example.js

## 7. Heroku

You need a Heroku account and the [Heroku Toolbelt][herokutoolbelt] to run the following commands. Basically Heroku runs `node webcap-service.js`, the same way one would do it by hand.

```bash
$ heroku login
$ heroku create --buildpack https://github.com/ddollar/heroku-buildpack-multi.git
# the key necessary to use the REST API (optional)
$ heroku config:set APIKEY=mysecretkey
$ git push heroku master
$ heroku config:set PATH=/app/bin:/app/node_modules/.bin:/app/vendor/phantomjs/bin:/usr/local/bin:/usr/bin:/bin
```

Now you can issue requests to your application's URL as per documentation. The URL can be seen by running `heroku info`.

*Heroku's architecture expects a reply to be sent within 30 seconds. Thus it is advisable to cap the timeout to a value under 30 seconds, so as to receive a proper response from Webcap, and not an error from Heroku.*

  [herokutoolbelt]: https://toolbelt.heroku.com/


## 8. License

[Public Domain. See UNLICENSE.txt][license].

Mention of origin would be appreciated.

  [license]: http://unlicense.org
