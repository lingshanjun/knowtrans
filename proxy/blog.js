var Blog  = require('../models/blog');
var BlogCategory  = require('../models/blog_category');

/**
 * 新建blog并存储
 */
exports.newAndSave = function (title, slug, brief, content, callback) {
    var blog = new Blog();
    blog.title = title;
    blog.slug = slug;
    blog.brief = brief;
    blog.content = content;

    blog.save(callback);
};

/**
 * 根据关键字，获取一组分类
 * Callback:
 * - err, 数据库异常
 * - blogs, 分类列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getBlogsByQuery = function (query, opt, callback) {
    Blog.find(query, '', opt, callback);
};

/**
 * 获得所有的category
 * Callback:
 * - err, 数据库异常
 * - categorys, 分类列表
 */
exports.getAllBlogs = function(callback){
    Blog.find({}, callback);
}