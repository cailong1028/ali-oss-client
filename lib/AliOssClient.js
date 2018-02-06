/*global process, require*/

var co = require('co');
var OSS = require('ali-oss');

var log = require('./log');

var aliOssClientConf = require('./ali-oss-client-conf');

//use class path NODE_ENV, defualt 'development'
var _aliOssClient = new OSS(aliOssClientConf[process.env.NODE_ENV] || 'development');

function AliOssClient(opts){
    if(opts){
        this._aliOssClient = new OSS(opts);
    }else{
        this._aliOssClient = _aliOssClient;
    }
}

var aliOssClientCommands = [
    'putBucket', //创建bucket
    'listBuckets',//查看bucket
    'list', //查看object

];

aliOssClientCommands.forEach(oneCommand => {
    AliOssClient.prototype[oneCommand] = function(){
        var args = Array.prototype.slice.call(arguments);
        var self = this;
        var gn = function* (){
            var result = yield self._aliOssClient[oneCommand](args);
            //log.info('['+oneCommand+'] '+JSON.stringify(result));
            return result;
        };
        return co(gn);
    }
});

module.exports = AliOssClient;