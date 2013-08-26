'use strict';

var q = require('q');

// module for coloring console output
var cli = null;
try {
    cli = require('cli-color');
} catch(e) {
    // except we don't know if this exception was the results of the module we just required, or something inside it
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
}

module.exports = test;


// used to convey last failed test case's desc to test.failed
var _failed = undefined;

// display description for current test
// set up test.deferred so it can be used to resolve or reject the current test (do not use it's .promise)
// reject test.deferred after timeout
// handle test case's success and failure, chain after them using test.promise
function test(desc, tvalue) {
    if (!tvalue) tvalue = 2000;

    var pad = '-----------------------------------------------------------------------------';
    var txt = '  @ '+ desc+ ' '+ pad.slice(2 + desc.length);
    
    if (cli) console.log(cli.whiteBright(txt))
    else console.log(txt);
    
    test.deferred = q.defer();
    test.promise = test.deferred.promise.timeout(tvalue).then(
        // inform the current test passed (with optional, promise-chain-forwarded result)
        test.pass = function pass(result) {
            var txt = '  (√)';
            if (cli) console.log(cli.green(txt))
            else console.log(txt);

            console.log();
            return result
        },
        // log failed test and re-pass-it-along the promise-chain
        function(e) {
            test._failed = desc
            throw e;
        }
    );
}

// return last failed test's desc
test.failed = function failed() {
    return test._failed;
}

// run func and catch exception. if catch, reject test.deferred with it
test.guard = function guard(func) {
    return function() {
        try { func(); }
        catch (e) { test.deferred.reject(e); }
    }
}

// display text so it fits output. accepts parameters exactly like console.log
test.log = function log() {
    console.log.apply(console, ['  >'].concat(Array.prototype.slice.call(arguments)));
}

// tallies info (from test.fail to test.exit) on whether exceptions were shown or not
var caught = false;

// inform that a test failed
test.fail = function fail(e, msg) {
    var txt = '  (×) ';
    if (cli) console.log(cli.red(txt))
    else console.log(txt);
    
    console.log();
    if (e instanceof Error) console.log(e.stack); else console.log(e);
    console.log();
    
    // so that test.exit doesn't re-show this message
    caught = true;
    throw e;
}

// used to set process exit code in case of errors and display error in case it wasn't already displayed by test.fail
test.exit = function exit(e) {
    if (!caught) if (e instanceof Error) console.log(e.stack); else console.log(e);
    if (e) process.exit(1);
}
