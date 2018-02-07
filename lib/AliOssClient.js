/*global process, require, Promise*/

var co = require('co');
var OSS = require('ali-oss');

var log = require('./log');

var aliOssClientConf = require('./ali-oss-client-conf');
//use class path NODE_ENV, defualt 'development'
var clientConfig = aliOssClientConf[process.env.NODE_ENV] || 'development';
// var _aliOssClient = new OSS(clientConfig);

function AliOssClient(opts){
    if(opts){
        this.clientConfig = Object.assign(clientConfig, opts);
        this._aliOssClient = new OSS(this.clientConfig);
    }else{
        this.clientConfig = clientConfig;
        this._aliOssClient = new OSS(clientConfig);
        // this._aliOssClient = _aliOssClient;
    }
}

//异步命令
var aliOssClientCommands = [
    //Bucket
    'putBucket', //创建bucket
    'deleteBucket', //删除bucket 如果该Bucket下还有文件存在，则需要先删除所有文件才能删除Bucket。如果该Bucket下还有未完成的上传请求，则需要通过listUploads和 abortMultipartUpload先取消请求才能删除Bucket。
    'listBuckets',//查看bucket
    'getBucketACL', //查看bucket权限
    'putBucketACL', //设置bucket权限，设置putBucketACL的时候需要带上region，详见单元测试
    //Object
    'put', //上传文件
    'putStream', //流式上传
    'multipartUpload', //分片上传
    'get', //下载文件，以及buffer方式
    'getStream', //流式下载文件
    'delete', //删除文件
    'deleteMulti', //批量删除
    'list', //查看object // 不带任何参数，默认最多返回1000个文件
    //uploads
    'listUploads', //列出所有正在上传请求
    'abortMultipartUpload', //终止multipartUpload
];

//同步命令
var aliOssClientSyncCommands = [
    'useBucket', //client 选择 bucket
    'signatureUrl', //生成object 的 http url
];

aliOssClientSyncCommands.forEach(oneSyncCommand => {
    AliOssClient.prototype[oneSyncCommand] = function(){
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        log.info('ali-oss-client invoke sync function ['+oneSyncCommand+'] and arguments is ' + JSON.stringify(args));
        var result = self._aliOssClient[oneSyncCommand].apply(self._aliOssClient, args);
        return result;
    };
});

aliOssClientCommands.forEach(oneCommand => {
    AliOssClient.prototype[oneCommand] = function(){
        var args = Array.prototype.slice.call(arguments);
        var self = this;
        var gn = function* (){
            log.info('ali-oss-client invoke async function ['+oneCommand+'] and arguments is ' + JSON.stringify(args));
            //使用apply修复添加参数时候的问题
            var result = yield self._aliOssClient[oneCommand].apply(self._aliOssClient, args);
            return result;
        };
        return co(gn);
    }
});

module.exports = AliOssClient;