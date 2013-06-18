"use strict";

/*
	Usage:
	$ phantomjs webcap.js <json>"
		<json> JSON-formatted array of settings, which include:
		Mandatory:
			"url"					(str) URL to screenshot
		Optional:
			"viewportWidth"			(int) Width of the viewport of the virtual browser (default=1024)
			"viewportHeight"		(int) Height of the viewport of the virtual browser (default=768)
			"clipWidth"				(int) Width of resulting screenshot (default=viewportWidth)
			"clipHeight"			(int) Height of resulting screenshot (default=viewportHeight)
			"timeout"				(int) Maximum time in seconds that this whole command is allowed to take (default=30)
			"cookies"				(arr) Cookies available to servers during the screenshot (default=[])
										{
											"name":"cookie_name",		// required property
											"value":"cookie_value",		// required property
											"domain":'example.lan',		// required property
											"path":'/foo',
											"httponly":bool,	// is cookie available outside http (javascript)
											"secure":bool,		// send cookie only if using secure protocol
										}
			"userAgent"				(str)  User agent to identify self with (default=phantomjs default)
			"javascript"			(bool) Is Javascript enabled? (default=true)
			"maxBytes"				(int)  Maximum allowed total received bytes (default=1024*1024*5)
			"maxRedirects"			(int)  Maximum allowed total redirections (default=40)
									       (40=Semi-random maximum. Firefox had 20, apparently for one resource, but we count total..)
			
	Return value:
		0	Screenshot successful. JSON-formatted data written to stdout.
			Values available:
				"title"				Title of the screenshotted web page
				"image"				The actual screenshot in PNG format
		Anything else is an error. Details written to stdout & stderr.
*/

/*
$phantomjs scrncap.js | tail -c +10 | head -c -2 | base64 --decode - > capture.png
*/

/*
 * -- separator
 */

var err = function(msg) {
	console.error(msg);
	phantom.exit(1);
}

var out = function(msg) {
	console.log(msg);
}

phantom.onError = function(msg, trace) {
	// in case of errors, print error and exit phantomjs
	err("Error: " + msg + "\n" + JSON.stringify(trace, null, " "));
}

args  = require('system').args;

// ensure correct amount of arguments are available
if (args.length != 2) err("Usage: See source code for detailed usage");

// parse arguments
var args = JSON.parse(args[2]);
if (args === undefined) err("Error: Failed to parse JSON-formatted arguments");

// ensure mandatory arguments are present
if (args["url"] === undefined) {
	err("Error: url must be specified");
}

// default values for optional arguments
if (args["viewportWidth"] === undefined) args["viewportWidth"] = 1024;
if (args["viewportHeight"] === undefined) args["viewportHeight"] = 768;
if (args["clipWidth"] === undefined) args["clipWidth"] = args["viewportWidth"];
if (args["clipHeight"] === undefined) args["clipHeight"] = args["viewportHeight"];
if (args["timeout"] === undefined) args["timeout"] = 30;
if (args["cookies"] === undefined) args["cookies"] = [];
if (args["userAgent"] === undefined) args["userAgent"] = [];
if (args["javascript"] === undefined) args["javascript"] = true;
if (args["maxBytes"] === undefined) args["maxBytes"] = 1024*1024*5;
if (args["maxRedirects"] === undefined) args["maxRedirects"] = 40;


/*
 * -- separator
 */

page = require('webpage').create();

page.viewportSize = { width:args["viewportWidth"], height:args["viewportHeight"] };
page.clipRect = { top:0, left:0, width:args["clipWidth"], height:args["clipHeight"] };
page.settings.userAgent = args["userAgent"];
page.settings.javascriptEnabled = args["javascript"];

args["cookies"].forEach(function(elem, idx, arr) {
	if (page.addCookie(elem) === false) {
		err("Error: Failed to add the following cookie:\n" + elem);
	}
})

// print settings that are now in effect
out("url: "+args["url"]);
out("viewport rect: "+ page.viewportSize.width+ ", "+ page.viewportSize.height);
out("clip rect: "+ page.clipRect.width+ ", "+ page.clipRect.height);
out("timeout: "+args["timeout"]);
out("cookies: "+page.cookies);
out("user agent: "+page.settings.userAgent);
out("javascript enabled: "+page.settings.javascriptEnabled);
out("max bytes: "+args["maxBytes");
out("max redirects: "+args["maxRedirects");


/*
 * -- separator
 */

page.open(args["url"]);

redirects = 0;
receivedBytes = 0;
// this keeps track of last response in case failure happens (though reason of failure could be different..)
lastResponse = '';

page.onResourceReceived = function(response) {
	// console.log(JSON.stringify(response)+"\n");
	if (response.stage == 'end') lastResponse = response;
	if (response.redirectURL) redirects++;
	if (response.bodySize) receivedBytes += response.bodySize
	
	if (receivedBytes > args["maxBytes"]) {
		err("Error: exceeded specified total allowed received bytes")
	}
	
	if (redirects > args["maxRedirects"]) {
		err("Error: exceeded specified total allowed redirects")
	}
};

// when page loading finishes: if success: capture page. exit phantomjs
page.onLoadFinished = function(status) {
	switch(status) {
		case 'success':
			window.setTimeout(function () {
				imageData = page.renderBase64("PNG");
				//page.render("captured.png");
				out(JSON.stringify({
					"title":page.title,
					"image":imageData // TODO:base64?/documentation?
				}));
				phantom.exit();
			}, 200);
			break;
		
		case 'fail':
		// TODO: DOES THIS FAIL IN CASE OF SUB-REQUEST FAILING? if so, must devise means to an end with onResourceReceived..?
		default:
			err("Error: failed, last response: "+ JSON.stringify(lastResponse));
	}
}

// abort if full page not received after x seconds
setTimeout(function() {
	err("Error: timeout exceeded");
}, args["timeout"] * 1000);

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
