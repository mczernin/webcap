module.exports = {

    err: function() {
        console.log.apply(this,arguments);
        process.exit(1);
    },

    out: function() {
        console.log.apply(this,arguments);
    },

    /**
     * @see http://stackoverflow.com/questions/8656106/why-is-function-prototype-bind-slow
     */
    bindDirect: function(bindThis, func) {
        return function() {
            return func.apply(bindThis, arguments);
        }
    },

    /**
     * @see http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
     */
    toType: function(obj) {
        return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },

    inspect: function(obj) {
        return this.toType(obj)+ " = "+ require('util').inspect.apply(this, [ obj, {'showHidden':true,'colors':true}, ' ' ]);
    },
    
    fixError: function(err, name) {
        err.name = name;
        return err;
    }
    
}
