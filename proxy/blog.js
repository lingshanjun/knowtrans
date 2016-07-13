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

/**
 * 根据blog的slug获得某篇blog
 * @param {String} slug
 * @param {Function} callback 回调函数
 * Callback:
 * - err, 数据库异常
 * - blog, 某篇blog
 */
exports.getBlogBySlug = function(slug, callback){
    Blog.findOne({'slug': slug}, callback);
}

/**
 * 根据blog的_id获得某篇blog
 * @param {String} _id
 * @param {Function} callback 回调函数
 * Callback:
 * - err, 数据库异常
 * - blog, 某篇blog
 */
exports.getBlogById = function(id, callback){
    Blog.findOne({'_id': id}, callback);
}

/**
 * 根据blog的_id更新某篇blog
 * @param {String} id
 * @param {String} new_title
 * @param {String} new_slug
 * @param {String} new_brief
 * @param {String} new_content
 * @param {Function} callback 回调函数
 * Callback:
 * - err, 数据库异常
 */
exports.updateById = function(id, new_title, new_slug, new_brief, new_content, new_content_html, callback){
    Blog.update(
        {'_id': id},
        {$set:{
                'title': new_title,
                'slug': new_slug,
                'brief': new_brief,
                'content': new_content,
                'content_html': new_content_html,
                'update_at': new Date()
            }
        },
        callback
    )
}