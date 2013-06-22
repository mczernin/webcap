var restify = require('restify');
var server = restify.createServer();

var port = process.env.PORT || 5000;

server.listen(port);
//server.pre(restify.pre.userAgentConnection());
/*server.pre(function(req, res, next) {
    req.headers['connection'] = 'close';
});*/

var getDateString = function()  {
    var date = new Date();
    return date.getUTCFullYear()+ "-"+ (date.getUTCMonth()+1)+ "-"+ date.getUTCDate()+ " "+ date.getUTCHours()+ ":"+ date.getUTCMinutes()+ ":"+ date.getUTCSeconds();
}

server.post('/webcap', function create(req, res, next) {
    req.socket.setTimeout(3000, function() {
        req.socket.end();
        //res.json({status:'timeout'})
    });
    
    req.setEncoding('utf8');
    req.on('readable', function() {
        var data = req.read();
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.log(getDateString(), req.connection.remoteAddress, 'json parsing failed');
            res.json({status:'json parsing failed'});
            return;
        }
        
        console.log(getDateString(), req.connection.remoteAddress, data.asdd);
        res.json();
    });
    
});

console.log("Listening on " + port);



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
