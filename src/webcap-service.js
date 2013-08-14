'use strict';

var http = require('http')
    , post = require('request').post
    , spawn = require('child_process').spawn
    , util = require('util')
    , o = require('./utils')
    , validateRequestSchema = require('./objectValidator').validateRequestSchema;
    ;
    
// read "CONSTANTS" from environment or use defaults
var PORT = process.env.PORT || 5000
    , APIKEY = process.env.KEY
    , MAXWORKERS = process.env.MAXWORKERS || 5
    ;

// set up HTTP server
var server = http.createServer();

server.timeout = 5000;
server.listen(PORT, function() {
    o.out("Listening on " + PORT);
});

// set up work queue
var activeWorkers = 0
    , workQueue = []
    , numWorks = 0
    ;
    
// HTTP request handler
server.on('request', function(req, res) {

    // if request not understood, send 404
    if (!(req.method == 'POST' && req.url.match(/^\/webcap\/?$/))) {
        reply(res, 'Not Found');
        return;
    }
    
    // determine POST body length
    var bodylen = 0;
    for (var key in req.headers) {
        if (key.toLowerCase() == 'content-length') bodylen = req.headers[key];
        if (key.toLowerCase() == 'content-encoding') {
            reply(res, 'Content-Encoding is not supported');
            return;
        }
    }
    if (bodylen == 0) {
        reply(res, 'Content-Length must be supplied');
        return;
    }
    
    // read POST body
    var read = 0, body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
        read += chunk.length;
        
        if (read == bodylen) {
            // POST body completely received
            
            req.removeAllListeners();
            
            // parse POST data as JSON
            try {
                var reqPost = JSON.parse(body)
            } catch (e) {
                reply(res, 'Invalid JSON');
                return;
            }
            
            // validate request json format
            if (!validateRequestSchema(reqPost)) {
                reply(res, 'Request JSON didn\' validate. Check documentation');
                return;
            }
            
            // check APIKEY
            if (reqPost.opts.key !== APIKEY) {
                reply(res, 'Incorrect API key');
                return;
            }
            delete reqPost.opts.key;
            
            // call respective handler
            if (reqPost.opts.callbackUrl) {
                asyncApi(reqPost, req, res);
            } else {
                syncApi(reqPost, req, res);
            }
        }
    });
});

// handler for http ASYNCHRONOUS api
function asyncApi(reqPost, req, res) {

    // queue work items
    reqPost.urls.forEach(function(loopEntry) {
        var workItem = {};
        workItem.sync = false;
        workItem.req = req;
        workItem.res = res;
        
        workItem.webcap = {
            opts: reqPost.opts,
            urls: [{
                url: loopEntry.url,
                callbackData: loopEntry.callbackData
            }]
        }
        workItem.num = ++numWorks;
        
        workQueue.push(workItem);
    });
    
    reply(res, null, 'Queued '+reqPost.urls.length+' URLs');
}

// handler for http SYNCHRONOUS api
function syncApi(reqPost, req, res) {

    // queue work item
    var workItem = {};
    workItem.sync = true;
    workItem.req = req;
    workItem.res = res;
    
    workItem.webcap = {
        opts: reqPost.opts,
        urls: reqPost.urls
    }
    workItem.num = ++numWorks;
    
    // set synchronous work's timeout, as it's already handled by work queue (yea, a bit bad)
    req.setTimeout(0);
    
    workQueue.push(workItem);
}

// work queue handler
setInterval(function() {

    if (activeWorkers >= MAXWORKERS) {
        // no free workers to process queue. naive implementation, but will do for now
        // ideally process function should be called as a result of "work added to queue" and
        // "worker process finished (or exits, in this case)"
        return;
    }
    // worker count is under limit = can spawn new worker
    
    if (workQueue.length == 0) return;
    // there's work to be done
    var workItem = workQueue.shift();
    
    // set default timeout value
    workItem.webcap.opts.timeout = workItem.webcap.opts.timeout != null ? workItem.webcap.opts.timeout*1000 : 30000;
    
    o.out(getDateString(), 'Work#'+workItem.num, '('+(activeWorkers+1)+'/'+MAXWORKERS+')', 'IP:'+workItem.req.connection.remoteAddress, 'URL:'+workItem.webcap.urls[0].url);
    
    // start the webcap process
    var p = spawn('phantomjs', ['webcap.js', JSON.stringify(workItem.webcap)]);
    
    workItem.process = p;
    activeWorkers++;
    
    // set timeout handler for work item
    // webcap process can take some time to convey it's result to this process. give it 3 seconds
    workItem.req.setTimeout(0);
    workItem.timeoutId = setTimeout(
        workTimeout,
        workItem.webcap.opts.timeout + 3000,
        workItem
        );
    
    var spawnTime = new Date().getTime()
        , outbuf = ''
        , errbuf = ''
        ;
    
    p.stdout.on('data', function(chunk) {
        // out("DEBUG:",data.toString());
        outbuf += chunk;
    });
    
    p.stderr.on('data', function(chunk) {
        // out("DEBUG:",data.toString());
        errbuf += chunk;
    });
    
    var lastError = null;
    p.on('error', function(e) {
        //err(res, 'webcap failed. err:'+ e+ ', stdout:'+ outbuf+ ', stderr:'+ errbuf);
        lastError = e;
    });
    
    p.on('exit', function(code, signal) {
        var nowTime = new Date().getTime();
        var tookSecs = Math.round((nowTime - spawnTime) / 1024);
        
        if (code == 0) {
            // webcap process exited successfully
            o.out(getDateString(), 'Work#'+workItem.num, '('+(activeWorkers-1)+'/'+MAXWORKERS+')', tookSecs+'sec', 'OK');
            
            // send response
            if (workItem.sync) {
                reply(workItem.res, null, outbuf);
            } else {
                callbackReply(workItem, null, outbuf);
            }
        } else {
            // webcap exited with error
            var bufMsgs = ('StdOut:'+ outbuf+ ', StdErr:'+ errbuf).replace(/[\r\n\t]+/g, ' ');
            o.out(getDateString(), 'Work#'+workItem.num, '('+(activeWorkers-1)+'/'+MAXWORKERS+')', tookSecs+"sec", 'FAIL: LastError:'+ lastError+ ', '+ bufMsgs);
            
            // send response
            if (workItem.sync) {
                reply(workItem.res, 'Failed: '+bufMsgs);
            } else {
                callbackReply(workItem, 'Failed: '+bufMsgs);
            }
        }
        
        clearTimeout(workItem.timeoutId);
        activeWorkers--;
    });
    
}, 1000);

// timeout handler
function workTimeout(workItem) {
    o.out(getDateString(), workItem.num, 'timeout');
    
    // kill process
    process.removeAllListeners();
    process.on('exit', function() {
        activeWorkers--;
        o.out(getDateString(), 'Work#'+workItem.num, '('+(activeWorkers)+'/'+MAXWORKERS+')', 'FAIL: Timeout');
    });
    process.kill('SIGKILL');
    
    // remove from work queue
    var idx = workQueue.indexOf(workItem);
    if (idx !== -1) workQueue = workQueue.splice(idx, 1);
    
    // send reply to client
    if (workItem.sync) {
        // request was SYNCHRONOUS
        reply(workItem.res, 'Timeout');
    } else {
        // request was ASYNCHRONOUS
        callbackReply(workItem, 'Timeout');
    }
}

// handle SYNCHRONOUS request's replies
function reply(res, err, data) {
    if (err) {
        data = {
            status: 'error',
            message: err
        }
    } else {
        data = {
            status: 'success',
            data: data
        }
    }
    
    var httpCode = data.status == 'error' ? 500 : 200;
    data = JSON.stringify(data);
    
    res.writeHead(httpCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': new Buffer(data, 'utf8').length
    });
    res.end(data, 'utf8');
}

// handle ASYNCHRONOUS request's replies
function callbackReply(workItem, err, data) {

    if (err) {
        data = {
            status: 'error',
            message: err
        }
    } else {
        data = {
            status: 'success',
            data: data
        }
    }
    
    data.callbackData = workItem.webcap.urls[0].callbackData;
    data = JSON.stringify(data);
    
    post(
        {
            uri: workItem.webcap.opts.callbackUrl,
            body: data,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            timeout: 10000
        },
        function (err, res, body) {
            if (err || res.statusCode != 200) {
                if (res) var sc = res.statusCode
                o.out(getDateString(), 'Work#'+workItem.num, 'CALLBACK:FAIL: Error:'+err, 'HttpStatus:'+sc);
            } else {
                o.out(getDateString(), 'Work#'+workItem.num, 'CALLBACK:OK');
            }
        }
    );
}


// -- helper functions below

function getDateString()  {
    var date = new Date();
    return util.format('%s-%s-%sT%s:%s:%sZ',
        date.getUTCFullYear(),
        pad(date.getUTCMonth()+1, 2, '0'),
        pad(date.getUTCDate()+1, 2, '0'),
        pad(date.getUTCHours()+1, 2, '0'),
        pad(date.getUTCMinutes()+1, 2, '0'),
        pad(date.getUTCSeconds()+1, 2, '0')
        );
}

/*
see http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript/10073761#10073761
*/
function pad(str, len, repchr) {
    if (str.length > len) return str;
    
    var pad = '';
    for (var i=0; i<len; i++) pad += repchr;
    
    return (pad+str).slice(-len);
}

/*
function copy(fromObject) {
    var newObject = {};
    for (var attribName in fromObject) {
        newObject[attribName] = fromObject[attribName];
    }
    return newObject;
}
*/
