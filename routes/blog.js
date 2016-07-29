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
var moment = require('moment');
var cheerio = require('cheerio');

/**
 * url: /blog
 * blog列表页
 */
router.get('/', function(req, res, next){
    var category = req.query.category;  // slug
    var findobj = {'state': 'publish'};

    var ep = eventproxy.create('getId', function(findobj){
        BlogModel.paginate(
            findobj,
            { populate: 'categories', sort: '-_id', page: req.query.page, limit: req.query.limit },
            function(err, result){
                if (err) {
                    return next(err);
                }

                _.each(result.docs, function(blog){
                    var regx = new RegExp('<hr style=\"page-break-after:always;\" class=\"page-break editormd-page-break\" />');
                    var r = regx.exec(blog.content_html);
                    if (r != null) {
                        var html = blog.content_html.slice(0, r.index);
                        blog.brief = html;
                    }
                });

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
            }
        );
    });


    if (category) {
        BlogCategoryModel.findOne({'slug': category}).exec(function(err, result){
            if (err) {
                return ep.emit('getId', findobj);
            }
            findobj.categories = result.id;
            return ep.emit('getId', findobj);
        });
    }else{
        return ep.emit('getId', findobj);
    }


});


/**
 * url: /blog/archive
 * blog归档页
 */
router.get('/archive', function(req, res, next){
    var year = req.query.year;
    var month = req.query.month;
    res.locals.filter = {
        'year': year,
        'month': month
    };
    var ep = eventproxy.create('getNavs', 'getBlogs', function(navs, blogs){

        return res.render('blog/archive', {'title': 'blog归档页', blogs: blogs, achiveNavs: navs});
    });

    BlogModel.find({'state': 'publish'}).exec(function(err, blogs){
        if (err) {
            return next(err);
        }
        var tmpNavs = [];
        _.each(blogs, function(item) {
            var d = moment(item.create_at);
            var y = d.year();
            var m = d.month() + 1;
            var obj = {year: y, month: m};
            var flag = false;

            for(var i=0, len=tmpNavs.length; i<len; i++){
                if (_.isEqual(obj, tmpNavs[i])) {
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                tmpNavs.push(obj);
            }

        });
        tmpNavs = _.sortBy(tmpNavs, 'year');
        return ep.emit('getNavs', tmpNavs);
    });

    var query = BlogModel.find({'state': 'publish'});

    if (year && month) {
        month = parseInt(month);
        year = parseInt(year);
        var low = year+'-'+month, high = year+'-'+(month+1);
        if (month == 12) {
            high = (year+1)+'-1';
        }
        query.where('create_at').gt(low).lt(high);
    }

    query.sort('create_at').populate('categories', 'id name slug').exec(function(err, blogs){
        if (err) {
            return next(err);
        }

        ep.emit('getBlogs', blogs);

    });

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

        if (blog.state === 'draft') {
            return next();
        }

        blog.views++;
        blog.save();

        blog.create_at_ago = blog.create_at_ago();

        // blog.content = marked(blog.content); //将markdown解析为html
        res.render('blog/blog_detail', {title: blog.title, blog: blog});
    });

});


module.exports = router;