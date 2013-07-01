var restify = require('restify');

// init

var spawn = require('child_process').spawn;
var server = restify.createServer();

var port = process.env.PORT || 5000;
var key = process.env.KEY;


server.listen(port);
console.log("Listening on " + port);


// functions

var getDateString = function()  {
    var date = new Date();
    return date.getUTCFullYear()+ "-"+ (date.getUTCMonth()+1)+ "-"+ date.getUTCDate()+ " "+ date.getUTCHours()+ ":"+ date.getUTCMinutes()+ ":"+ date.getUTCSeconds();
}

var err = function(res, msg) {
    res.setHeader('content-type', 'text/plain');
    res.send(400, msg);
}

// handlers

// server.pre(function(req, res, next) {
//     req.headers.connection = 'close';
//     res.setHeader('connection', 'close');
//     return next();
// });

var onRequest = function(req, res) {
    var data = req.read();
    
    try {
        data = JSON.parse(data);
    } catch (e) {
        console.log(getDateString(), req.connection.remoteAddress, 'json parsing failed');
        err(res, 'json parsing failed');
        return;
    }
    
    if (data.key !== key) {
        err(res, 'wrong key');
        return;
    }
    // no need for the key to be submitted to the webcap cmdline program
    delete data.key;
    
    var requestNum = ++onRequest.requests;
    
    console.log(getDateString(), requestNum, req.connection.remoteAddress, data.url);
    
    setTimeout(function() {
        p.removeAllListeners();
        err(res, 'hard timeout');
        console.log(getDateString(), requestNum, "d"+tookSecs, 'FAIL/HARD TIMEOUT');
        
        p.kill('SIGKILL');
    }, data.timeout == undefined ? 30000 : data.timeout);
    
    var p = spawn('phantomjs', ['webcap.js', JSON.stringify(data)]);
    var spawnTime = new Date().getTime();
    
    var outbuf = '';
    var errbuf = '';
    
    p.stdout.on('data', function(data) {
        outbuf += data;
    });
    
    p.stderr.on('data', function(data) {
        errbuf += data;
    });
    
    var lastError = null;
    p.on('error', function(e) {
        //err(res, 'webcap failed. err:'+ e+ ', stdout:'+ outbuf+ ', stderr:'+ errbuf);
        lastError = e;
    });
    
    p.on('close', function(code, signal) {
    
        var nowTime = new Date().getTime();
        var tookSecs = Math.round((nowTime - spawnTime) / 1024);
        
        if (code == 0) {
            console.log(getDateString(), requestNum, tookSecs+"s", 'OK');
            res.send(JSON.parse(outbuf));
        } else {
            var bufMsgs = ('stdout:'+ outbuf+ ', stderr:'+ errbuf).replace(/[\r\n\t]+/g, ' ');
            
            console.log(getDateString(), requestNum, tookSecs+"s", 'FAIL:'+ lastError+ ', '+ bufMsgs);
            err(res, 'webcap failed. err:'+ lastError+ '. '+ bufMsgs);
        }
    });
    
}

onRequest.requests = 0;

server.post('/webcap', function create(req, res, next) {
    req.setEncoding('utf8');
    req.on('readable', function() {
        onRequest(req, res);
    });
});


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
