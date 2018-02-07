module.exports = {
    development: {
        region: 'oss-cn-beijing', //默认oss-cn-hangzhou
        internal: false, //配合region使用，true表示内网访问
        secure: false, //配合region使用，true表示使用https访问
        endpoint: null, //例如http://oss-cn-beijing.aliyuncs.com，如果指定了endpoint，则region会被忽略，endpoint可以指定HTTPS，也可以是IP形式
        cname: false, //配合endpoint使用，如果指定了cname为true，则将endpoint视为用户绑定的自定义域名
        bucket: null, //如果未指定bucket，则进行Object相关的操作时需要先调用useBucket接口（只需要调用一次）
        timeout: 60000, //默认为60秒，指定访问OSS的API的超时时间,
        accessKeyId: 'your accessKeyId',
        accessKeySecret: 'your accessKeySecret',
    },
    production: {
        region: 'oss-cn-beijing', //默认oss-cn-hangzhou
        internal: false, //配合region使用，true表示内网访问
        secure: false, //配合region使用，true表示使用https访问
        endpoint: null, //例如http://oss-cn-hangzhou.aliyuncs.com，如果指定了endpoint，则region会被忽略，endpoint可以指定HTTPS，也可以是IP形式
        cname: false, //配合endpoint使用，如果指定了cname为true，则将endpoint视为用户绑定的自定义域名
        bucket: null, //如果未指定bucket，则进行Object相关的操作时需要先调用useBucket接口（只需要调用一次）
        timeout: 60000, //默认为60秒，指定访问OSS的API的超时时间
        accessKeyId: 'your accessKeyId',
        accessKeySecret: 'your accessKeySecret',
    }
};