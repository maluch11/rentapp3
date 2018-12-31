var levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
var noop = function () {};

module.exports = function (opts) {
    opts = opts || {};
    opts.level = opts.level || 'info';
    
    var logger = {};
    
    var shouldLog = function (level) {
        return levels.indexOf(level) >= levels.indexOf(opts.level);
    }
    
    levels.forEach(function (level) {
        logger[level] = shouldLog(level) ? log : noop;
        
        function log () {
            var prefix = opts.prefix;
            var normalizedLevel;
            
            if (opts.stderr) {
                normalizedLevel = 'error';
            } else {
                switch (level) {
                    case 'trace': normalizedLevel = 'info'; break
                    case 'debug': normalizedLevel = 'info'; break
                    case 'fatal': normalizedLevel = 'error'; break
                    default: normalizedLevel = level
                }
            }
            
            console.log(arguments[0]);
        }
    });
    
    return logger;
}
