var Blog  = require('../models/blog');
var BlogCategory  = require('../models/blog_category');

/**
 * 新建blog并存储
 */
exports.newAndSave = function (title, callback) {
  var blog         = new Blog();

  blog.save(callback);
};

