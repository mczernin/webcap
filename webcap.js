/*
$phantomjs scrncap.js | tail -c +10 | head -c -2 | base64 --decode - > capture.png
*/

// in case of errors, print error and exit phantomjs
phantom.onError = function(msg, trace) {
	console.log(msg);
	console.log(JSON.stringify(trace));
	phantom.exit();
}

// include phantomjs system library
system = require('system')

// ensure correct amount of arguments are available
if (system.args.length != 2) {
	console.log("Usage: "+ system.args[0] + " url");
	phantom.exit();
}

// url to render to image
url = system.args[1];

// include phantomjs webpage library
page = require('webpage').create();

// web worker settings
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17';
//page.settings.javascriptEnabled = false;
page.viewportSize = { width:935, height:938 }
page.clipRect = { top:0, left:0, width:page.viewportSize.width, height:page.viewportSize.height };

// take care of "redirect count" and "bytes received" limits
redirects = 0;
receivedBytes = 0;

// this keeps track of last response in case failure happens (though reason of failure could be different..)
lastResponse = '';

// if limits are reached, inform and exit phantomjs
page.onResourceReceived = function(response) {
	// console.log(JSON.stringify(response)+"\n");
	if (response.state == 'end') {
		lastResponse = response;
	}
	
	if (response.redirectURL) redirects++;
	if (response.bodySize) receivedBytes += response.bodySize
	
	if (receivedBytes > 1024*1024*10) { // 10 MiB
		console.log("TOOBIG");
		phantom.exit();
	}
	
	if (redirects > 20 * 2) { // semi-random maximum. firefox had 20 (apparently for one resource), but we count total..
		console.log("TOOMANYREDIRECTS");
		phantom.exit();
	}
};

// abort if full page not received after x seconds
setTimeout(function() {
	console.log("TIMEOUT");
	phantom.exit();
}, 1000 * 15); // 15s

// when page loading finishes: if success: capture page. exit phantomjs
page.onLoadFinished = function(status) {
	switch(status) {
		case 'success':
			window.setTimeout(function () {
				//imageData = page.renderBase64("PNG");
				//console.log("RENDERED:["+imageData+"]");
				page.render("captured.png");
				console.log("RENDERED");
				phantom.exit();
			}, 200);
			break;
		
		case 'fail':
		default:
			console.log("FAIL,LASTRESPONSE:"+JSON.stringify(lastResponse));
			phantom.exit();
	}
}

// begin request
page.open(url);

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
