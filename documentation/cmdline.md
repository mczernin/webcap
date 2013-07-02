## Usage:

    $ phantomjs webcap.js <json>
    
`json` JSON-encoded parameters (key:value).

### Mandatory parameters:

`"url"` (str) — URL to screenshot.

### Optional parameters:

`"viewportWidth"` (int, default:1024) — Width of the viewport of the virtual browser.  
`"viewportHeight"` (int, default:768) — Height of the viewport of the virtual browser.  
`"clipWidth"` (int, default:viewportWidth) — Width of resulting screenshot.  
`"clipHeight"` (int, default:viewportHeight) — Height of resulting screenshot.  
`"zoom"` (dec, default:1.0, range:0..1 ) — Viewport zoom factor.  
`"timeout"` (int, default:28) — Maximum time in seconds this script is allowed to execute.  
`"cookies"` (arr, default:[]) — Cookies available to servers during the screenshot.

>     cookie = {
>         "name":"cookie_name",           // required property
>         "value":"cookie_value",         // required property
>         "domain":"example.com",         // required property
>         "path":"/foo",
>         "httponly":bool,      // is cookie available outside http (to javascript)
>         "secure":bool         // send cookie only if using secure protocol
>     }

`"userAgent"` (str, default:PhantomJS's default) — User agent to identify self with.  
`"javascript"` (bool, default:true) — Is Javascript enabled?  
`"maxBytes"` (int, default:1024*1024*5) — Maximum allowed total received bytes.  
`"maxRedirects"` (int, default:40) — Maximum allowed total redirections.  

### Return value:
`0` – Screenshot successful. JSON data written to stdout:

>     json = {
>         "arguments",             Arguments applied to the request (for information/"debugging" only)
>         "bytesReceived",         Total bytes received (all requests & subrequest combined)
>         "title",                 Title of the screenshotted web page
>         "headers",               Headers received from the server ({key:value}*n)
>         "body",                  Body data of the screenshotted web page after browser engine has interpreted it
>                                  (Javascript might have done modifications to it as well)
>         "image",                 The actual screenshot in PNG format, encoded in Base64
>     }

`?` – Any other exit code means an error occurred. Details written to stdout & stderr.
        
### Examples:
Debug (spits everything at your face):  
`$ phantomjs webcap.js '{"url":"http://fox.com"}'`

Display screenshot using [ImageMagick][imagemagick]:  
`$ phantomjs webcap.js '{"url":"http://fox.com"}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-`

Using many parameters, screenshotted website displayed with ImageMagick:

    $ phantomjs webcap.js '{"url":"http://fox.com","viewportWidth":128,"viewportHeight":128,"zoom":0.1,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0"}' | grep -oP '(?<= "image": ").*(?=")' | base64 -d | display png:-

  [imagemagick]: http://www.imagemagick.org
