var Blog  = require('../models/blog');
var BlogCategory  = require('../models/blog_category');

/**
 * 新建分类并存储
 */
exports.newAndSave = function (name, slug, callback) {
    var category = new BlogCategory();
    category.name = name;
    category.slug = slug;

    category.save(callback);
};

/**
 * 根据关键字，获取一组分类
 * Callback:
 * - err, 数据库异常
 * - categorys, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getCategorysByQuery = function (query, opt, callback) {
    BlogCategory.find(query, '', opt, callback);
};