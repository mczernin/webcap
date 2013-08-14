"use strict";

var page = require('webpage').create();

var err = function(msg) {
    phantom.exit(1);
}

var out = function(msg) {
    console.log(msg);
}

phantom.onError = function(msg, trace) {
    // in case of errors, print error and exit phantomjs
    err("Error: " + msg + "\n" + JSON.stringify(trace, null, " "));
}


// -- separator


var args = require('system').args;

// ensure correct amount of arguments are available
if (args.length != 2) err("Usage: See documentation");

// parse arguments
try {
    var j = JSON.parse(args[1]);
} catch (e) {
    err("Error: Failed to parse JSON-formatted arguments");
}

// half-hearted attempt at validating request object format
// cannot use objectValidator.js, because it's for nodejs :(
// let's assume format is ok, because 1) it's used through webcap-service.js which already validated it
// or 2) webcap.js is used by another program, in which case if phantomjs exits with other than ExitCode 0,
// the host-program knows something went wrong and information about it is available in stdout/stderr

if (!j.opts instanceof Object || !j.urls instanceof Array || !j.urls[0] instanceof Object || !j.urls[0].url instanceof String) {
    err('Request JSON didn\' validate. Check documentation');
}

// default values for optional arguments
if (j.opts.viewportWidth === undefined) j.opts.viewportWidth = 1024;
if (j.opts.viewportHeight === undefined) j.opts.viewportHeight = 768;
if (j.opts.clipWidth === undefined) j.opts.clipWidth = j.opts.viewportWidth;
if (j.opts.clipHeight === undefined) j.opts.clipHeight = j.opts.viewportHeight;
if (j.opts.zoom === undefined) j.opts.zoom = 1;
if (j.opts.timeout === undefined) j.opts.timeout = 30;
if (j.opts.cookies === undefined) j.opts.cookies = [];
if (j.opts.userAgent === undefined) j.opts.userAgent = null;
if (j.opts.javascript === undefined) j.opts.javascript = true;
if (j.opts.maxBytes === undefined) j.opts.maxBytes = 1024*1024*5; // 5 MiB
if (j.opts.maxRedirects === undefined) j.opts.maxRedirects = 40; // Semi-random maximum. Firefox had 20 (assuming not counting sub-requests), but we count total..


// -- separator


// abort if script execution exceeds x seconds
setTimeout(function() {
    err("Error: timeout exceeded");
}, j.opts.timeout * 1000);

page.viewportSize = { width:j.opts.viewportWidth, height:j.opts.viewportHeight };
page.clipRect = { top:0, left:0, width:j.opts.clipWidth, height:j.opts.clipHeight };
page.zoomFactor = j.opts.zoom;
if (j.opts.userAgent != null) page.settings.userAgent = j.opts.userAgent;
page.settings.javascriptEnabled = j.opts.javascript;

j.opts.cookies.forEach(function(elem, idx, arr) {
    elem.httpOnly = elem.httponly;
    delete elem.httponly;
    if (page.addCookie(elem) === false) {
        err("Error: Failed to add the following cookie:\n" + elem);
    }
});

var sentCookies = phantom.cookies;


// -- separator


page.open(j.urls[0].url);

var redirects = 0;
var receivedBytes = 0;
// the following variable keeps track of last response in case failure happens (though reason of failure could be different, because view of this variable happens elsewhere than where it's set)
var lastResponse = '';
// headers received from first http response
var mainHeaders = {};

page.onResourceReceived = function(response) {
    // last response is printed in case fetch fails 
    if (response.stage == 'end') lastResponse = response;
    
    // dont count body size and redirects more than once (start & end)
    if (response.stage == 'start') {
        /*
         * count body size only before receiving data, aka let's not "wait to receive 5mb and check if maxBytes exceeded", rather, read content-length beforehand
         */
        if (response.bodySize) receivedBytes += response.bodySize
        if (response.redirectURL) redirects++;
    }
    
    if (receivedBytes > j.opts.maxBytes) {
        // observing crash after phantom.exit(1)
        err("Error: Exceeded specified total allowed received bytes")
    }
    
    if (redirects > j.opts.maxRedirects) {
        // observing crash after phantom.exit(1)
        err("Error: Exceeded specified total allowed redirects")
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

// when page loading finishes:
page.onLoadFinished = function(status) {
    switch(status) {
        case 'success':
            // if success: print print output according to documentation contract. exit with code:0
            window.setTimeout(function () {
                var imageData = page.renderBase64("PNG");
                
                var resObj = {
                    opts:{
                        viewportWidth: page.viewportSize.width,
                        viewportHeight: page.viewportSize.height,
                        clipWidth: page.clipRect.width,
                        clipHeight: page.clipRect.height,
                        zoom: j.opts.zoom,
                        timeout: j.opts.timeout,
                        cookies: sentCookies,
                        userAgent: page.settings.userAgent,
                        javascript: page.settings.javascriptEnabled,
                        maxBytes: j.opts.maxBytes,
                        maxRedirects: j.opts.maxRedirects
                    },
                    url: j.urls[0].url,
                    title: page.title,
                    headers: mainHeaders,
                    bytesReceived: receivedBytes,
                    redirected: redirects,
                    image: imageData  // base64 necessary? js cannot handle binary data? / remember to update doc?
                };
                
                // add body to response only if it's text. otherwise risk sending full resolution image
                for (var key in mainHeaders) {
                    if (key.toLowerCase() == 'content-type') {
                        // fast and loose matching. justification:this is not so mission critical
                        if (mainHeaders[key].match(/(?:text\/html|application\/xhtml\+xml|application\/xml|text\/plain)/i)) {
                            resObj.body = page.content;    // alt(difference?): page.evaluate(function() { return document.documentElement.outerHTML }) .. needs base64 encoding?
                        }
                    }
                }
                
                out(JSON.stringify(resObj)); //TODO: space not necessary, but easier to read
                
                phantom.exit();
            }, 200);
            break;
        
        case 'fail': // TODO: DOES THIS FAIL IN CASE OF SUB-REQUEST FAILING? if so, must go around with onResourceReceived..?
        default:
            err("Error: HTTP request failed. Last response: "+ JSON.stringify(lastResponse));
    }
}
