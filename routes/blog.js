var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var marked = require('marked');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');
var Blog  = require('../proxy/blog');
var BlogModel = require('../models/blog');
var BlogCategoryModel = require('../models/blog_category');
var paginate = require('express-paginate');
var _ = require('underscore');


/**
 * url: /blog
 * blog列表页
 */
router.get('/', function(req, res, next){
    Blog.getAllBlogs({ populate: 'categories', sort: '-_id', page: req.query.page, limit: req.query.limit }, function(err, result){
        if (err) {
            return next(err);
        }
        var curPage = res.locals.paginate.page;
        var limit = res.locals.paginate.limit;
        var pages = paginate.getArrayPages(req)(3, result.pages, curPage);
        var hasPreviousPages = curPage > 1;
        var hasNextPages = curPage < result.pages;
        var prevUrl = '', nextUrl = '';

        if (hasPreviousPages && pages.length) {
            prevUrl = pages[0].url.replace(/page=(\d)+/i, 'page='+(curPage-1));
        }
        if (hasNextPages && pages.length) {
            nextUrl = pages[0].url.replace(/page=(\d)+/i, 'page='+(curPage+1));
        }

        pagination = {
            pageCount: result.pages,
            itemCount: result.total,
            curPage: curPage,
            limit: limit,
            hasPreviousPages: hasPreviousPages,
            hasNextPages: hasNextPages,
            prevUrl: prevUrl,
            nextUrl: nextUrl,
            pages: pages
        }

        res.render('blog/blog', {
            title:'blog分类列表',
            blogs: result.docs,
            pagination: pagination
        });
    })
});


/**
 * url:/blog/slug
 * blog 详情页
 */
router.get('/:slug', function(req, res, next){
    var slug = validator.trim(req.params.slug);

    Blog.getBlogBySlug(slug, function(err, blog){
        if (err) {
            return next(err);
        }

        blog.views++;
        blog.save();

        blog.create_at_ago = blog.create_at_ago();

        // blog.content = marked(blog.content); //将markdown解析为html
        res.render('blog/blog_detail', {title: blog.title, blog: blog});
    });

});


/**
 * url: /blog/category/slug
 * blog分类列表
 */
router.get('/category/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    Blog.getBlogsByCategoryId(id, function(err, blogs){
        if (err) {
            return next(err);
        }

        res.render('blog/blog', {title:'分类blogs列表', blogs: blogs});
    });
});



module.exports = router;