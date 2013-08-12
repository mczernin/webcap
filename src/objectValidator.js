'use strict';

/**
* Validate Javascript objects against project-specific JSON Schemas
* @module objectValidator
*/

var validator = require('amanda');

var requestSchema = {
    type:'object', properties:{
        opts:{ type:'object', additionalProperties:false, properties:{
            key:{ type:'string' },
            viewportWidth:{ type:'integer' },
            viewportHeight:{ type:'integer' },
            clipWidth:{ type:'integer' },
            clipHeight:{ type:'integer' },
            zoom:{ type:'number' },
            timeout:{ type:'integer', minimum:2 },
            cookies:{ type:'array', minItems:1, items:{
                type:'object', additionalProperties:false, properties:{
                    cookieName:{ type:'string', required:true },
                    value:{ type:'string', required:true },
                    domain:{ type:'string', required:true },
                    path:{ type:'string' },
                    httpOnly:{ type:'boolean' },
                    secure:{ type:'boolean' },
                }
            }},
            userAgent:{ type:'string' },
            javascript:{ type:'boolean' },
            maxBytes:{ type:'integer' },
            maxRedirects:{ type:'integer' },
            callbackUrl:{ type:'string' },
        }},
        urls:{ type:'array', required:true, minItems:1, items:{
            type:'object', additionalProperties:false, properties:{
                url:{ type:'string', required:true },
                callbackData:{ type:'string' }
            }
        }}
    }
}

/**
* Validate `object` against JSON API request schema
* @param {object} Any javascript object that is to be validated
* @return {boolean} True=`object` didn't validate against request schema, False=`object` validated against request schema
*/
module.exports.validateRequestSchema = function(object) {
    var ret = undefined;
    validator.validate(object, requestSchema, function(err) {
        if (err) ret = false;
        else ret = true;
    });
    return ret;
    return 'asd';
}
