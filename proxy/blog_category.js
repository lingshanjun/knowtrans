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
