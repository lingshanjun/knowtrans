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
var authMiddleWare = require('../middlewares/auth');
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
    var static_url = ['add', 'category', 'category/add'];
    var flag = false;

    for(i = 0; i < static_url.length; i++){
        if (slug == static_url[i]) {
            flag = true;
            break;
        }
    }

    if (flag) {
        next();
    }else{
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
    }
});


/**
 * url: /blog/add
 * blog添加文章页
 * 需要管理员权限
 */
router.get('/add', authMiddleWare.adminRequired, function(req, res, next){
    res.render('blog/blog_add', {title: '添加blog', error:''});
});

router.post('/add', authMiddleWare.adminRequired, function(req, res, next){
    var title = validator.trim(req.body.title);
    var slug = validator.trim(req.body.slug);
    var brief = validator.trim(req.body.brief);
    var content = validator.trim(req.body.content);
    var content_html = validator.trim(req.body['blogContentEdite-html-code']);
    var state = validator.trim(req.body.state);
    var categories = req.body.newCategories;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
    });

    if(!title){
        return ep.emit('add_err', 422, '文章标题不能为空');
    }
    if(!slug){
        return ep.emit('add_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(slug)) {
        return ep.emit('add_err', 422, 'slug含有不允许的字符');
    }
    if(!categories){
        return ep.emit('add_err', 422, '没有选择分类');
    }
    if(!brief){
        return ep.emit('add_err', 422, '简介不能为空');
    }
    if (!content) {
        return ep.emit('add_err', 422, '内容不能为空');
    }


    var ep2 = eventproxy.create("getBlogs", "getCategories", function (noblog, objCategories) {
        Blog.newAndSave(title, slug, brief, content, content_html, state, objCategories, function(err, blog){
            if (err) {
                return next(err);
            }

            _.each(objCategories, function(item){
                item.blogs.push(blog);
                item.save(function(err){
                    if (err) {
                        return next(err);
                    }
                });
            });
            // res.redirect('/blog');
            res.status(200);
            return res.json({url: '/blog/'+blog.slug});
        });
    });
    Blog.getBlogsByQuery({'$or':[{'title': title},{'slug': slug}]},{},
        function(err, blogs){
            if (err) {
                return next(err);
            }

            if (blogs.length > 0) {
                return ep.emit('add_err', 422, '文章标题或slug已被占用');
            }

            ep2.emit('getBlogs', true);
        }
    );
    BlogCategory.getCategoriesByIds(categories, function(err, objCategories){
        if (err) {
            return next(err);
        }
        ep2.emit('getCategories', objCategories);
    });

});


/**
 * url: /blog/delete/id
 * blog 删除
 * 需要管理员权限
 */
router.post('/delete/:id', authMiddleWare.adminRequired, function(req, res, next){
    var id = validator.trim(req.params.id);

    Blog.removeById(id, function(err){
        if (err) {
            return next(err);
        }
        BlogCategoryModel.update({'blogs': id}, {$pull: {'blogs': id}}, {multi: true}, function(err){
            if (err) {
                return next(err);
            }
            res.status(200);
            return res.json({ message: "删除成功"});
        });
    });
});


/**
 * url: /blog/category/slug
 * blog分类列表
 */
router.get('/category/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    if (id == 'add') {
        return next();

    }
    Blog.getBlogsByCategoryId(id, function(err, blogs){
        if (err) {
            return next(err);
        }

        res.render('blog/blog', {title:'分类blogs列表', blogs: blogs});
    });
});



module.exports = router;