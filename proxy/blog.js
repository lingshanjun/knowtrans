var Blog  = require('../models/blog');
var BlogCategory  = require('../models/blog_category');
var paginate = require('express-paginate');
/**
 * 新建blog并存储
 */
exports.newAndSave = function (title, slug, brief, content, content_html, state, views, categories, callback) {
    var blog = new Blog();
    blog.title = title;
    blog.slug = slug;
    blog.brief = brief;
    blog.content = content;
    blog.content_html = content_html;
    blog.state = state;
    blog.views = views;
    blog.categories = categories;

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
 * 获得所有的blogs
 * Callback:
 * - err, 数据库异常
 * - blogs, blog列表
 */
exports.getAllBlogs = function(opts, callback){
    // Blog.find({}, callback);
    Blog.paginate({}, opts, callback);
}

/**
 * 根据某category id 获得所有的blogs
 * Callback:
 * - err, 数据库异常
 * - blogs, blog列表
 */
exports.getBlogsByCategoryId = function (id, callback) {
    Blog.find({categories: id}).populate('categories', '_id name slug').exec(callback);
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
    Blog.findOne({'slug': slug}).populate('categories', '_id name slug').exec(callback);
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
    Blog.findOne({'_id': id}).populate('categories', '_id name slug').exec(callback);
}

/**
 * 根据blog的_id更新某篇blog
 * @param {String} id
 * @param {String} new_title
 * @param {String} new_slug
 * @param {String} new_brief
 * @param {String} new_content
 * @param {array}  new_categories
 * @param {Function} callback 回调函数
 * Callback:
 * - err, 数据库异常
 */
exports.updateById = function(id, new_title, new_slug, new_brief, new_content, new_content_html, new_state, new_views, new_categories, callback){
    Blog.update(
        {'_id': id},
        {$set:{
                'title': new_title,
                'slug': new_slug,
                'brief': new_brief,
                'content': new_content,
                'content_html': new_content_html,
                'state': new_state,
                'views': new_views,
                'categories': new_categories,
                'update_at': new Date()
            }
        },
        callback
    )
}

/**
 * 根据blog的_id删除某个blog
 * @param {String} _id
 * @param {Function} callback 回调函数
 * Callback:
 * - err, 数据库异常
 */
exports.removeById = function(id, callback){
    Blog.remove({'_id': id}).exec(callback);
}