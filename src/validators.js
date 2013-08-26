'use strict';

/**
* JSON validators
* @module validators
*/

var jss = require('js-schema');


/**
* Ensure that `object` matches request schema
* @param {object} Object to be validated
* @return {boolean} True=Matched, False=Didn't match
*/
module.exports.validateRequest = jss({
    '?opts': jss({
        'key': String,
        '?viewportWidth': Number,
        '?viewportHeight': Number,
        '?clipWidth': Number,
        '?clipHeight': Number,
        '?zoom': Number,
        '?timeout': Number,
        '?cookies': Array.of(1, Infinity, jss({
            'cookieName': String,
            'value': String,
            'domain': String,
            '?path': String,
            '?httpOnly': Boolean,
            '?secure': Boolean,
            })),
        '?userAgent': String,
        '?javascript': Boolean,
        '?maxBytes': Number,
        '?maxRedirects': Number,
        '?callbackUrl': String
    }),
    'urls': Array.of(1, Infinity, jss({
        'url': String,
        '?callbackData': String
        }))
});


/**
* Ensure that `object` matches response schema
* @param {object} Object to be validated
* @return {boolean} True=Matched, False=Didn't match
*/
module.exports.validateResponse = jss({
    '?opts': jss({
        'viewportWidth': Number,
        'viewportHeight': Number,
        'clipWidth': Number,
        'clipHeight': Number,
        'zoom': Number,
        'timeout': Number,
        'userAgent': String,
        'javascript': Boolean,
        'maxBytes': Number,
        'maxRedirects': Number
    }),
    'url': String,
    'title': String,
    'headers': jss({
        '*': String
        }),
    'bytesReceived': Number,
    'redirects': Number,
    'image': String,
    '?body': String
});
