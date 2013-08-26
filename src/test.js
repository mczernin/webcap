'use strict';

var schemas = require('./validators')
    , o = require('./utils')
    , q = require('q')
    , test = require('./gtest')
    , expect = (function() {var chai=require('chai'); chai.Assertion.includeStack = true; return chai.expect})()
;

q.resolve(true)
    .then(function(result) {
        test('SETUP', 1000);
        test.log('1:', result);
        // var d = q.defer();
        
        setTimeout(test.guard(function() {
            // test.log('SETUP FAILED')
            test.deferred.resolve('asd');
            // d.reject(new Error('SETUP FAILED'));
            // throw new Error('SETUP FAILED');
        }), 100);
        
        // return test.decide(d.promise, 1000);
        return test.promise;
        //return test.pass('asdf');
        // expect(true).false;
        // return d.promise.timeout(100, 'asd').then(test.pass);
        // 
    })
    .then(function(result) {
        test('testcase 1');
        test.log('2:',result);
        setTimeout(test.guard(function() {
            // test.deferred.reject(new Error('abla abla'));
            test.deferred.resolve(new Error('abla abla'));
        }),1000);
        
        return test.promise;
    })
    .fail(test.fail)
    .fin(function() {
        test('CLEANUP after');
        if (test.failed() == 'SETUP') {
            test.log('deep','shit');
        }
        test.deferred.resolve();
        return test.promise;
    })
    .fail(test.exit)
    .done()
    ;

// console.log('---------------------------');
// console.log('---------------------------');
// console.log('---------------------------');
// console.log('---------------------------');
