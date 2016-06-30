/**
 * 自定义验证方法
 */

exports.validateUserName = function (str) {
  return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

