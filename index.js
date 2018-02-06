var AliOssClient = require('./lib/AliOssClient');
var log = require('./lib/log');

var client = new AliOssClient();
client.listBuckets().then(result => {
    log.info(result.buckets.length);
}).catch(err => {
    log.error(err.stack);
});