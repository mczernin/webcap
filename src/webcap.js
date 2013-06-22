"use strict";

var err = function(msg) {
    console.log(msg);
    phantom.exit(1);
}

var out = function(msg) {
    console.log(msg);
}

phantom.onError = function(msg, trace) {
    // in case of errors, print error and exit phantomjs
    err("Error: " + msg + "\n" + JSON.stringify(trace, null, " "));
}


/*
 * -- separator
 */

var args = require('system').args;

// ensure correct amount of arguments are available
if (args.length != 2) err("Usage: See source code for detailed usage");

// parse arguments
try {
    var args = JSON.parse(args[1]);
} catch (e) {
    err("Error: Failed to parse JSON-formatted arguments");
}

// ensure mandatory arguments are present
if (args["url"] === undefined) {
    err("Error: url must be specified");
}

// default values for optional arguments
if (args["viewportWidth"] === undefined) args["viewportWidth"] = 1024;
if (args["viewportHeight"] === undefined) args["viewportHeight"] = 768;
if (args["clipWidth"] === undefined) args["clipWidth"] = args["viewportWidth"];
if (args["clipHeight"] === undefined) args["clipHeight"] = args["viewportHeight"];
if (args["zoom"] === undefined) args["zoom"] = 1;
if (args["timeout"] === undefined) args["timeout"] = 30;
if (args["cookies"] === undefined) args["cookies"] = [];
if (args["userAgent"] === undefined) args["userAgent"] = [];
if (args["javascript"] === undefined) args["javascript"] = true;
if (args["maxBytes"] === undefined) args["maxBytes"] = 1024*1024*5; // 5 MiB
if (args["maxRedirects"] === undefined) args["maxRedirects"] = 40; // Semi-random maximum. Firefox had 20 (apparently for one resource), but we count total..


/*
 * -- separator
 */

// abort if script execution exceeds x seconds
setTimeout(function() {
    err("Error: timeout exceeded");
}, args["timeout"] * 1000);

var page = require('webpage').create();

page.viewportSize = { width:args["viewportWidth"], height:args["viewportHeight"] };
page.clipRect = { top:0, left:0, width:args["clipWidth"], height:args["clipHeight"] };
page.zoomFactor = args["zoom"];
page.settings.userAgent = args["userAgent"];
page.settings.javascriptEnabled = args["javascript"];

args["cookies"].forEach(function(elem, idx, arr) {
    if (page.addCookie(elem) === false) {
        err("Error: Failed to add the following cookie:\n" + elem);
    }
});

var sentCookies = phantom.cookies;

/*phantom.cookies.forEach(function(elem, idx, arr) {
    console.log(JSON.stringify(elem));*/
    /*var nc = {};
    for (var k in c) {
        console.log(c);
        nc[k] = c[k];
    }
    sentCookies.push(nc);*/
/*});*/


/*
 * -- separator
 */

page.open(args["url"]);

var redirects = 0;
var receivedBytes = 0;
// the following variable keeps track of last response in case failure happens (though reason of failure could be different, because view of this variable happens elsewhere than where it's set)
var lastResponse = '';
var mainHeaders = {};

page.onResourceReceived = function(response) {
    if (response.stage == 'end') lastResponse = response;
    
    // dont count body size and redirects more than once (start & end)
    if (response.stage == 'start') {
        /*
         * count body size only before receiving data, aka "let's wait to receive 5mb and check if maxBytes exceeded, rather than if we knew content-length beforehand"?
         */
        if (response.bodySize) receivedBytes += response.bodySize
        if (response.redirectURL) redirects++;
    }
    
    if (receivedBytes > args["maxBytes"]) {
        // observing crash after phantom.exit(1)
        err("Error: exceeded specified total allowed received bytes")
    }
    
    if (redirects > args["maxRedirects"]) {
        // observing crash after phantom.exit(1)
        err("Error: exceeded specified total allowed redirects")
    }
    
    if (response.stage == 'end' && page.url == response.url) { // relying on observed behavior
        /*
         * couldn't find documentation for response.headers content.
         * assuming [{'name':'blabla','value':'blabla'}*n], as observed during example run
         */
        response.headers.forEach(function(elem, idx, arr) {
            mainHeaders[elem.name] = elem.value;
        });
    }
};

// when page loading finishes: if success: capture page. exit phantomjs
page.onLoadFinished = function(status) {
    switch(status) {
        case 'success':
            window.setTimeout(function () {
                var imageData = page.renderBase64("PNG");
                //page.render("captured.png");
                out(JSON.stringify({
                    "arguments":{
                        "url":args["url"],
                        "viewport rect":page.viewportSize.width+ ", "+ page.viewportSize.height,
                        "clip rect":page.clipRect.width+ ", "+ page.clipRect.height,
                        "zoom factor":args["zoom"],
                        "timeout":args["timeout"],
                        "cookies":sentCookies,
                        "user agent":page.settings.userAgent,
                        "javascript enabled":page.settings.javascriptEnabled,
                        "max bytes":args["maxBytes"],
                        "max redirects":args["maxRedirects"]
                    },
                    "bytesReceived":receivedBytes,
                    "title":page.title,
                    "headers":mainHeaders,
                    "body":page.content, // alt(difference?): page.evaluate(function() { return document.documentElement.outerHTML })
                    "image":imageData, // TODO:base64 necessary? js cannot handle binary data? / documentation?
                }, null, " "));
                phantom.exit();
            }, 200);
            break;
        
        case 'fail':
        // TODO: DOES THIS FAIL IN CASE OF SUB-REQUEST FAILING? if so, must go around with onResourceReceived..?
        default:
            err("Error: failed, last response: "+ JSON.stringify(lastResponse));
    }
}


/* This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/
