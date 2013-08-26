'use strict';

var   expect = (function() {var chai=require('chai'); chai.Assertion.includeStack = true; return chai.expect})()
    , request = require('request')
    , schemas = require('../src/validators')
    , restify = require('restify')
    , o = require('../src/utils')
    , events = require('events')
    , httpApiServer = HttpApiServer()
    , dummyServer
;

q.resolve(true)
    .then(function(result) {
        var d = test('SETUP');
        
        httpApiServer.start({ PORT: 5000, APIKEY: 'laalaa' }, false);
        dummyServer = startDummyServer(1234);
        // stupidly assume server successfully started
        setTimeout(function() {
            d.resolve();
        }, 500);
        
        return test.timeout(d, 100);
        // return d.promise.timeout(100, 'asd').then(test.pass);
        // 
    })
    .then(function(result) {
        var d = test('testcase 1');
        test.log('1:',result);
        setTimeout(test.guard(d, function() {
            // d.reject(new Error('abla abla'));
            d.resolve(new Error('abla abla'));
        },500));
        
        return test.timeout(d, 2000);
    })
    .fail(test.fail)
    .fin(function() {
        test('CLEANUP');
        httpApiServer.stop();
        dummyServer.srv.close();
        test.pass();
    })
    .fail(test.exit)
    .done()
    ;


before(function(done) {
    httpApiServer.start({ PORT: 5000, APIKEY: 'laalaa' }, false);
    dummyServer = startDummyServer(1234);
    // stupidly assume server successfully started
    setTimeout(function() {
        done();
    }, 500);
});
    
xdescribe('Sync API: HTTP/POST', function() {

    this.timeout(5000);

    it('nothing', function(d) {
        post(d, httpApiServer.url, '', function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('{}', function(d) {
        post(d, httpApiServer.url, {}, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('1 url array item + wrong key', function(d) {
        post(d, httpApiServer.url, {
            opts: { key: 'wrongkey' },
            urls: [{ url: dummyServer.geturl }]
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('1 url array item + no opts', function(d) {
        post(d, httpApiServer.url, {
            urls: [{ url: dummyServer.geturl }]
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('no urls array + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: { key: 'laalaa' }
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('empty urls array + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: { key: 'laalaa' },
            urls: []
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('1 empty urls array item + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: { key: 'laalaa' },
            urls: [{}]
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('empty urls array + empty opts', function(d) {
        post(d, httpApiServer.url, {
            opts: {},
            urls: []
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('empty urls array + no opts', function(d) {
        post(d, httpApiServer.url, {
            urls: []
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    it('1 urls array item + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: { key: 'laalaa' },
            urls: [{ url: dummyServer.geturl }]
        }, function(resp, body) {
            expect(body.status).equal('success');
            body.data = toJSON(body.data);
            expect(schemas.validateResponse(body.data)).true;
        });
    });
    
    it('1 urls array item + correct key + opts', function(d) {
        post(d, httpApiServer.url, {
            opts: {
                key: 'laalaa',
                clipWidth: 64,
                clipHeight: 48,
                zoom: 0.063,
                timeout: 2
            },
            urls: [{ url: dummyServer.geturl }]
        }, function(resp, body) {
            expect(body.status).equal('success');
            body.data = toJSON(body.data);
            expect(schemas.validateResponse(body.data)).true;
        });
    });
    
});

describe('Async API, HTTP/POST:', function() {

// set real timeouts
// set real timeouts
// set real timeouts
// set real timeouts
// set real timeouts
    this.timeout(500000);

    xit('no urls array + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: {
                key: 'laalaa',
                callbackUrl: dummyServer.posturl
            }
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    xit('empty urls array + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: {
                key: 'laalaa',
                callbackUrl: dummyServer.posturl
            },
            urls: []
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    xit('1 empty url array item + correct key', function(d) {
        post(d, httpApiServer.url, {
            opts: {
                key: 'laalaa',
                callbackUrl: dummyServer.posturl
            },
            urls: [{}]
        }, function(resp, body) {
            expect(body.status).equal('error');
        });
    });
    
    
    it('1 urls array item + correct key + opts', function(d) {
        var u = dummyServer.posturl;
        
        post(d, httpApiServer.url, {
            opts: {
                key: 'laalaa',
                callbackUrl: dummyServer.posturl,
                clipWidth: 64,
                clipHeight: 48,
                zoom: 0.063,
                timeout: 2
            },
            urls: [{
                url: dummyServer.geturl,
                callbackData: '5'
            }]    
        }, function(resp, body, done) {
            expect(body.status).equal('success');
            expect(body.data).a('string');
            
            // validate callback
            /*
            dummyServer.lastCbData(function(body) {
                body = toJSON(body);
                expect(body.status).equal('success');
                body.data = toJSON(body.data);
                expect(schemas.validateResponse(body.data)).true;
                // expect(body.data.urls[0].url).equal(u);
                expect(true).false;
                // done();
                
                // try {
                // } catch (e) {
                    // throw e;
                // }
                
            });
            */
        });
    });
    
    /*
    it('3 urls + correct key + opts', function(d) {
        post(d, httpApiServer.url, '', function(resp, body) {
            expect(body.status).to.equal('success');
            body.data = toJSON(body.data);
            expect(schemas.validateResponse(body.data)).true;
            // validate callback
        });
    });
    
    it('13 urls + correct key + opts', function(d) {
        post(d, httpApiServer.url, '', function(resp, body) {
            expect(body.status).to.equal('success');
            body.data = toJSON(body.data);
            expect(schemas.validateResponse(body.data)).true;
            // validate callback
        });
    });
    */
    
});

function post(done, url, data, cb) {
    var p = {
        uri: url,
        body: data
    };
    if (data instanceof Object) p.json = true
    else p.headers = { 'Content-Type': 'text/plain' };
    
    request.post(p, function(err, resp, body) {
        if (err) expect(err+' '+ body).null;
        // if (jsonReply) {
            body = toJSON(body);
        // }
        if (cb.length == 2) cb(resp, body);
        else cb(resp,body, done);
    });
}

function toJSON(data) {
    if (!(data instanceof Object)) {
        expect(data).a('string');
        expect(function(){ data = JSON.parse(data) }).not.throw();
    }
    expect(data).a('object');
    return data;
}

function startDummyServer(port) {
    var cbEvent = new (require('events').EventEmitter)()
        , srv = restify.createServer()
        , cbData = undefined
        , ret = {
            geturl: 'http://localhost:' + port + '/',
            posturl: 'http://localhost:' + port + '/cb',
            postcb: function(req, res, next) {
                return next(new Error('No callback provided'));
            },
            port: port,
            lastCbData: function(cbFunc) {
                if (cbData === undefined) {
                    cbEvent.once('cbdata', function() { cbFunc(cbData); cbData = undefined });
                } else {
                    cbFunc(cbData);
                    cbData = undefined
                }
            }
        }
    ;
    
    srv.use(restify.bodyParser({ strict: false }));

    srv.get('/', function(req, res, next) {
        var body = '<div style="display:inline-box;width:640px;height:640px;border:1px solid red;background-color:silver"><h1>Hello World!</h1></div>';
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/html'
        });
        res.write(body);
        res.end();
    });

    srv.post('/cb', function(req, res, next) {
        cbData = req.body;
        expect(true).false;
        //cbEvent.emit('cbdata');
        
        var body = 'dummyserver post cb route ok';
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/html'
        });
        res.write(body);
        res.end();
    });
    
    // oh this baby gave me headaches, what an utterly stupid fallback it has to send error to client. well to each his/her own -_-
    srv.on('uncaughtException', function (request, response, route, error) {
        throw err;
    });
    
    srv.listen(port);
    ret.srv = srv;
    return ret;
}

function HttpApiServer() {
    var spawn = require('child_process').spawn;
    var p;

    var ret = {
        start: function(envVars, debugpipe) {
            p = spawn('node', ['webcap-service.js'], {
                cwd:'src',
                env:envVars
            });
            
            ret.url = 'http://localhost:'+ (envVars.PORT ? envVars.PORT : 5000)+ '/webcap';
            
            p.unref(); // dont wait for child process to exit
            if (debugpipe) {
                p.stdout.pipe(process.stdout);
                p.stderr.pipe(process.stderr);
            }
            /*
            p.stdout.setEncoding('utf8');
            p.stderr.setEncoding('utf8');
            
            p.stdout.on('data', function(c) {
                // ignore stdout data
                console.log(c.trim());
            });
            
            p.stderr.on('data', function(c) {
                // ignore stdout data
                console.log(c.trim());
            });
            */
            
            p.on('exit', function(code, signal) {
                console.log('(!!!) HttpApiServer exited.', 'ExitCode:'+code, 'Signal:'+signal);
                p = undefined;
            });
        },
        
        stop: function() {
            if (p) p.kill('SIGKILL');
            p = undefined;
        }
    }
    
    // dirty.. event signals after ret.stop, but works
    process.on('exit', ret.stop);

    return ret;
}
