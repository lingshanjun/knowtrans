/**
 * 自定义加解密相关
 */

var bcrypt = require('bcryptjs');

// 加密密码
exports.bhash = function (str, callback) {
  bcrypt.hash(str, 10, callback);
};

// 验证密码
exports.bcompare = function (str, hash, callback) {
  bcrypt.compare(str, hash, callback);
};
