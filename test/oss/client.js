const assert = require('assert');
const AliOssClient = require('../../lib/AliOssClient');
const log = require('../../lib/log');
const co = require('co');

describe('AliOssClient', function(){
    let client, newBucketName, newBucketName2, regStr;
    before(function(){
        client = new AliOssClient();
        newBucketName = 'simple-bucket-name';
        newBucketName2 = 'multi-bucket-name';
        regStr = 'anne-bqj';
    });

    //创建bucket
    it('putBucket', done => {
        co(function* (){
            let result1 = yield client.putBucket(newBucketName);
            let result2 = yield client.putBucket(newBucketName2);
            return [result1, result2];
        }).then(resultArray => {
            assert.equal(resultArray[0].bucket, newBucketName);
            assert.equal(resultArray[1].bucket, newBucketName2);
            done();
        }).catch(err => {
            log.error(err);
        });
    });

    //查看所有bucket
    it('listBuckets', done => {
        client.listBuckets().then(result => {
            // log.info(JSON.stringify(buckets.buckets));
            log.info(result.buckets.length);
            // assert.equal(result.buckets instanceof Array, true);
            assert.equal(Array.isArray(result.buckets), true);
            assert.equal(result.buckets.length > 0, true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //prefix 筛选bucket
    it('listBuckets prefix',done => {

        let reg = eval('/^'+regStr+'/g');
        client.listBuckets({prefix: 'anne-bqj'}).then(result => {
            assert.equal(reg.test(result.buckets[0].name), true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    after(function(){
        //删除测试bucket
        
    });
});