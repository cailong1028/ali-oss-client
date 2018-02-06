/*global require*/

var log4js = require('log4js');

log4js.configure({
    appenders: [
        {'type': 'console', 'category': 'ali-oss-client'},
        //config logfile and others
        // {
        //     'type': 'file',
        //     'filename': 'd:/workspace/ali-oss/log/oss.log',
        //     'maxLogSize': 2048000,
        //     'backups': 100,
        //     'category': 'ali-oss-client'
        // }
    ]
}, {reloadSecs: 300});
var logger = log4js.getLogger('ali-oss-client');

var _info = logger.info.bind(logger);
var _warn = logger.warn.bind(logger);
var _error = logger.error.bind(logger);

logger.info = (msg) => {
    _info(msg);
};
logger.warn = (msg) => {
    _warn(msg);
};
logger.error = (msg) => {
    _error(msg);
};

module.exports = logger;