## Usage:

    $ phantomjs webcap.js <json>
    
`json` JSON-encoded parameters (key:value).

### Mandatory parameters:

`urls[0].url` `str` — URL to screenshot.

The REST API accepts the same JSON request format. That's the reason for the `urls` array, in case you were wondering.

### Optional parameters:

`opts.viewportWidth` `int` (default:1024) — Width of the viewport of the virtual browser.  
`opts.viewportHeight` `int` (default:768) — Height of the viewport of the virtual browser.  
`opts.clipWidth` `int` (default:viewportWidth) — Width of resulting screenshot.  
`opts.clipHeight` `int` (default:viewportHeight) — Height of resulting screenshot.  
`opts.zoom` `number` (default:1.0, range:0..1) — Viewport zoom factor.  
`opts.timeout` `int` (default:28) — Maximum time in seconds this PhantomJS script is allowed to execute.  
`opts.cookies` `array` (default:[]) — Cookies available to servers during the screenshot. See below.

>     cookie = {
>         name: "cookie_name",           // required property
>         value: "cookie_value",         // required property
>         domain: "example.com",         // required property
>         path: "/foo",
>         httpOnly: bool,      // is cookie available outside http (to javascript)
>         secure: bool         // send cookie only if using secure protocol
>     }

`userAgent` `str` (default:PhantomJS's default) — User agent to identify self with.  
`javascript` `bool` (default:true) — Is Javascript enabled?  
`maxBytes` `int` (default:5242880 or 5MB) — Maximum allowed total received bytes.  
`maxRedirects` `int` (default:40) — Maximum allowed total redirections.

### Return value:
`0` – Screenshot successful. JSON data written to stdout:

>     {
>         opts: object,             Object containing parameters applied to the request (opts Object)
>         url: str,                 URL of the screenshotted web page
>         title: str,               Title of the screenshotted web page
>         headers: object,          Headers received from the server ({key:value}*n)
>         bytesReceived: int,       Total bytes received (all requests & subrequest combined)
>         redirected: int,          Redirect count of main request
>         body,                     Body text of the web page after browser engine has interpreted it
>                                   Note: Javascript might have done modifications to it as well
>                                   NOTE: The value will ONLY be set if response MIME type matches
>                                         text/html, application/xhtml+xml, application/xml or text/plain
>         image,                    The actual screenshot in PNG format, encoded in Base64
>     }

`?` – Any other exit code means an error occurred. Details written to stdout & stderr.
        
### Examples:
Debug (spits everything at your face):  
`$ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}]}'`

Display screenshot using [ImageMagick][imagemagick]:  
`$ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}]}'` | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-`

Using many parameters, screenshotted website displayed with ImageMagick:

    $ phantomjs webcap.js '{"urls":[{"url":"http://fox.com"}],"opts":{"viewportWidth":128,"viewportHeight":128,"zoom":0.1,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0"}}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-

  [imagemagick]: http://www.imagemagick.org
