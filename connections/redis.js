/*
    *** REDIS WRAPPER ***
    Author: Sumit S. Agrawal
*/

let redis;

// USE REDIS_PORT AND REDIS_HOST IF SPACIFIED
if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    redis = require("redis").createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
} else {
    redis = require("redis").createClient();
}

//END PROCESS IF REDIS GOT ERROR
redis.on("error", function (err) {
    console.log(err);
    process.exit(1)
});

module.exports.client = redis;
module.exports.setData = (key, value, callback) => {
    redis.set(key, value);
    callback(true);
};

module.exports.setDataWithEX = (key, value, timeout, callback) => {
    redis.set(key, value, 'EX', timeout);
    callback(true);
}

module.exports.getData = (key, callback) => {
    redis.get(key, function (err, value) {
        callback(value)
    });
};

module.exports.deleteData = (key, callback) => {
    redis.del(key, function (err, value) {
        callback(value)
    });
};

module.exports.setHashData = (mainKey, subKey, value, callback) => {
    redis.hset(mainKey, subKey, value, function (err, value) {
        callback(value)
    });
};

module.exports.setMultipleHashData = (mainKey, data, callback) => {
    redis.hmset(mainKey, data, function (err, value) {
        callback(value)
    });
};

module.exports.getHashData = (mainKey, subKey, callback) => {
    redis.hget(mainKey, subKey, function (err, value) {
        callback(value)
    });
};

module.exports.getAllHashData = (mainKey, callback) => {
    redis.hgetall(mainKey, function (err, value) {
        callback(value)
    });
};

module.exports.deleteHashData = (mainKey, subKey, callback) => {
    redis.hdel(mainKey, subKey, function (err, value) {
        callback(value)
    });
};

module.exports.setSetData = (mainKey, value, callback) => {
    redis.sadd(mainKey, value, function (err, value) {
        callback(value)
    });
};
module.exports.setSetMultipleData = (mainKey, value, callback) => {
    redis.sadd(mainKey, [value], function (err, value) {
        callback(value)
    });
};

module.exports.getAllSetData = (mainKey, callback) => {
    redis.smembers(mainKey, function (err, value) {
        callback(value)
    });
};
module.exports.deleteSetData = (mainKey, value, callback) => {
    redis.srem(mainKey, value, function (err, value) {
        callback(value)
    });
};

module.exports.getAllKeys = (pattern, callback) => {
    redis.keys(pattern, function (err, value) {
        callback(value)
    });
};

module.exports.flushAll = (callback) => {
    redis.flushall(function (err, value) {
        callback(value)
    });
};
