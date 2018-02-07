/*global require*/
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const AliOssClient = require('../../lib/AliOssClient');
const log = require('../../lib/log');
const co = require('co');

describe('AliOssClient', function(){
    let client, newBucketName, newBucketName2, regStr, acl, filesPath,
        downloadFilesPath, txtFileName, txtFileName2, txtFileNamePrefix,
        txtFileName2Prefix, txtFileName3, streamTxtFilename;
    before(function(){
        client = new AliOssClient();
        newBucketName = 'simple-bucket-name';
        newBucketName2 = 'multi-bucket-name';
        regStr = 'simple-bucket';
        acl = ['private', 'public-read', 'public-read-write'];
        filesPath = '../files/';
        downloadFilesPath = '../download-files';
        txtFileName = 'test.txt';
        txtFileNamePrefix = 'test';
        txtFileName2 = 'test2.txt';
        txtFileName2Prefix = 'test2';
        txtFileName3 = 'otherPrefixFile.txt';
        streamTxtFilename = 'streamTxtFilename.txt';
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

    //getBucketACL
    it('getBucketACL', done => {
        co(function* (){
            let result = yield client.getBucketACL(newBucketName);
            return result;
        }).then(result => {
            for(var oneAcl of acl){
                if(oneAcl === result.acl){
                    assert.ok(true);
                    break;
                }
            }
            done();
        }).catch(err => {
            log.error(err);
        });
    });

    //putBucketACL
    it('putBucketACL', done => {
        let setACLStr = 'private';
        co(function* (){
            yield client.putBucketACL(newBucketName, client.clientConfig.region, setACLStr);
            yield client.putBucketACL(newBucketName2, client.clientConfig.region, setACLStr);
            let result2 = yield client.getBucketACL(newBucketName);
            return result2;
        }).then(result2 => {
            if(setACLStr === result2.acl){
                assert.ok(setACLStr);
            }else{
                assert.fail(result2.acl);
            }
            done();
        }).catch(err => {
            log.error(err);
        });
    });

    //查看所有bucket
    it('listBuckets', done => {
        client.listBuckets().then(result => {
            // log.info(JSON.stringify(buckets.buckets));
            // log.info(result.buckets.length);
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
        client.listBuckets({prefix: regStr}).then(result => {
            // log.info(result.buckets);
            assert.equal(reg.test(result.buckets[0].name), true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //put
    it('put',done => {
        let bufferTestName = 'buffer-test';
        co(function* (){
            client.useBucket(newBucketName);
            let result = yield client.put(txtFileName, path.join(__dirname, filesPath, txtFileName));
            let result_2 = yield client.put(txtFileName3, path.join(__dirname, filesPath, txtFileName3));
            client.useBucket(newBucketName2);
            let result2 = yield client.put(txtFileName2, path.join(__dirname, filesPath, txtFileName2));
            let result2_2 = yield client.put(bufferTestName, new Buffer('buffer test text'));
            return [result, result_2, result2, result2_2];
        }).then(resultArray => {
            assert.equal(resultArray[0].name, txtFileName);
            assert.equal(resultArray[1].name, txtFileName3);
            assert.equal(resultArray[2].name, txtFileName2);
            assert.equal(resultArray[3].name, bufferTestName);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //putStream
    it('putStream', done => {
        co(function*(){
            client.useBucket(newBucketName);
            let stream = fs.createReadStream(path.join(__dirname, filesPath, streamTxtFilename));
            var result = yield client.putStream(streamTxtFilename, stream);
            return result;
        }).then(result => {
            // log.info(JSON.stringify(result));
            assert.ok(true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //multipartUpload
    it('multipartUpload', done => {
        co(function*(){
            let checkpoint;
            let percentage;
            let multiFileName = 'multipartUpload.jpg';
            client.useBucket(newBucketName);
            // let options = {
            //     checkpoint: checkpoint,
            //     partSize: 100*1024, //最小值是100*1024, 100KB
            //     progress: function*(_percentage, _checkpoint, _res){
            //         checkpoint = _checkpoint;
            //         percentage = _percentage;
            //         //模拟断点续传
            //         if(percentage > 0.6 && percentage < 1){
            //            throw new Error('mock err');
            //         }
            //         log.info('multipartUpload progress is '+Math.trunc(percentage*100)+'%');
            //     },
            //     meta: {
            //         from: 'image from cailong~s site',
            //         usage: 'test'
            //     }
            // };
            for(let i = 0; i < 5; i++){
                try{
                    log.error('断点续传第 '+ (i+1) +' 次尝试');
                    let result = yield client.multipartUpload(multiFileName, path.join(__dirname, filesPath, multiFileName), {
                        checkpoint: checkpoint,
                        partSize: 100*1024, //最小值是100*1024, 100KB
                        progress: function*(_percentage, _checkpoint, _res){
                            checkpoint = _checkpoint;
                            percentage = _percentage;
                            log.info('multipartUpload progress is '+Math.trunc(percentage*100)+'%');
                            //模拟断点续传
                            if(percentage > 0.6 && percentage < 1){
                                throw new Error('分片传输中断，需要断点续传');
                            }
                        },
                        meta: {
                            from: 'image from cailong~s site',
                            usage: 'test'
                        }
                    });
                    //上传完毕，退出循环
                    break;
                }catch(err){
                    //不要throw Error
                    log.error(err.stack);
                    continue;
                }
            }
        }).then(result => {
            assert.ok(true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });


    //get, 普通下载指定下载到本地的文件名
    it('get',done => {
        co(function* (){
            client.useBucket(newBucketName);
            let result = yield client.get(txtFileName, path.join(__dirname, downloadFilesPath, txtFileName));
            return result;
        }).then((result) => {
            // log.info(JSON.stringify(result));
            assert.ok(true);
            done();
        }).catch(err => {
            log.error('--------------------');
            log.error(err.stack);
        });
    });

    //get, 获取buffer
    it('get buffer', done => {
        co(function* (){
            client.useBucket(newBucketName);
            let result = yield client.get(txtFileName);
            return result;
        }).then((result) => {
            log.info('client get buffer to string is --> '+result.content.toString('utf8'));
            assert.ok(true);
            done();
        }).catch(err => {
            log.error(err.stack)
        });
    });

    //getStream
    it('getStream', done => {
        co(function* (){
            client.useBucket(newBucketName);
            let result = yield client.getStream(txtFileName);
            let writeStream = fs.createWriteStream(path.join(__dirname, downloadFilesPath, txtFileName+'_download'));
            result.stream.pipe(writeStream);
        }).then(() => {
            assert.ok(true);
            done();
        }).catch(err => {
            log.error(err.stack)
        });
    });

    //http get
    it('get http url',() => {
        client.useBucket(newBucketName);
        let url = client.signatureUrl(txtFileName, {expires: 1800, method: 'GET'});
        log.info('generate http url --> ' + url);
        assert.ok(true);
    });

    //list
    it('list and prefix', done => {
        co(function* (){
            // 不带任何参数，默认最多返回1000个文件
            client.useBucket(newBucketName);
            let result = yield client.list();
            client.useBucket(newBucketName2);
            let result2 = yield client.list();

            //列出前缀为'test-'的文件
            client.useBucket(newBucketName);
            let result3 = yield client.list({prefix: txtFileNamePrefix});
            client.useBucket(newBucketName2);
            let result4 = yield client.list({prefix: txtFileName2Prefix});
            return [result, result2, result3, result4];
        }).then(resultArray => {
            assert.equal(Array.isArray(resultArray[0].objects), true);
            // assert.equal(resultArray[0].objects.length, 3);
            // assert.equal(resultArray[2].objects.length, 1);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //delete
    it('delete',done => {
        co(function* (){
            client.useBucket(newBucketName);
            let result = yield client.delete(txtFileName);
            client.useBucket(newBucketName2);
            let result2 = yield client.delete(txtFileName2);
            return [result, result2];
        }).then(() => {
            // log.info(JSON.stringify(result));
            assert.ok(true);
            done();
        }).catch(err => {
            log.error(err.stack);
        });
    });

    //deleteMulti
    it('deleteMulti', done =>{
        co(function*(){
            client.useBucket(newBucketName);
            let bucket1Files = yield client.list();
            bucket1Files.objects ? yield client.deleteMulti(bucket1Files.objects.map(oneObj => oneObj.name),{quiet: true}) : void 0;
            client.useBucket(newBucketName2);
            let bucket2Files = yield client.list();
            bucket2Files.objects ?  yield client.deleteMulti(bucket2Files.objects.map(oneObj => oneObj.name),{quiet: true}) : void 0;
        }).then(() => {
            assert.ok(true);
            done();
            // log.info(JSON.stringify(resultArray));
        }).catch(err => {
            log.error(err.stack);
        });
    });

    after(function(){
        //删除创建的测试bucket
        co(function*(){
            //先删除bucket下面所有files和multipartUpload
            client.useBucket(newBucketName);
            let bucket1Files = yield client.list();
            if(bucket1Files.objects){
                yield client.deleteMulti(bucket1Files.objects.map(oneObj => oneObj.name),{quiet: true})
            }
            let uploadsResult = yield client.listUploads();
            if(uploadsResult.uploads){
                for(let i = 0; i < uploadsResult.uploads.length; i++){
                    let oneUpload = uploadsResult.uploads[i];
                    // log.info(oneUpload.name+' '+oneUpload.uploadId);
                    yield client.abortMultipartUpload(oneUpload.name, oneUpload.uploadId);
                }
            }
            client.useBucket(newBucketName2);
            let bucket2Files = yield client.list();
            if(bucket2Files.objects){
                yield client.deleteMulti(bucket2Files.objects.map(oneObj => oneObj.name),{quiet: true})
            }
            uploadsResult = yield client.listUploads();
            if(uploadsResult.uploads){
                for(let i = 0; i < uploadsResult.uploads.length; i++){
                    let oneUpload = uploadsResult.uploads[i];
                    // log.info(oneUpload.name+' '+oneUpload.uploadId);
                    yield client.abortMultipartUpload(oneUpload.name, oneUpload.uploadId);
                }
            }

            let result1 = yield client.deleteBucket(newBucketName);
            let result2 = yield client.deleteBucket(newBucketName2);
            //let bucketList = yield client.listBuckets({prefix: regStr});
            //assert.equal(bucketList.buckets.length, 0);
            return [result1, result2];
        }).then(resultArray => {
            // log.info(JSON.stringify(resultArray));
        }).catch(err => {
            log.error(err.stack);
        });
    });
});