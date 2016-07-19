var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var marked = require('marked');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');
var Blog  = require('../proxy/blog');
var authMiddleWare = require('../middlewares/auth');
var paginate = require('express-paginate');
/**
 * url: /blog
 * blog列表页
 */
router.get('/', function(req, res, next){
    Blog.getAllBlogs({ page: req.query.page, limit: req.query.limit }, function(err, result){
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

router.post('/add', function(req, res, next){
    var title = validator.trim(req.body.title);
    var slug = validator.trim(req.body.slug);
    var brief = validator.trim(req.body.brief);
    var content = validator.trim(req.body.content);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);
        res.render('blog/blog_add', { title: '添加blog', error: msg, blog:{title: title, slug: slug, brief: brief, content: content}});
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
    if(!brief){
        return ep.emit('add_err', 422, '简介不能为空');
    }
    if (!content) {
        return ep.emit('add_err', 422, '内容不能为空');
    }

    Blog.getBlogsByQuery({'$or':[{'title': title},{'slug': slug}]},{},
        function(err, blogs){
            if (err) {
                return next(err);
            }

            if (blogs.length > 0) {
                return ep.emit('add_err', 422, '文章标题或slug已被占用');
            }

            Blog.newAndSave(title, slug, brief, content, function(err){
                if (err) {
                    return next(err);
                }
                res.redirect('/blog');
            });
        }
    );
});


/**
 * url: /blog/edite/id
 * blog编辑页
 * 需要管理员权限
 */
router.get('/edite/:id', authMiddleWare.adminRequired, function(req, res, next){
    var id = validator.trim(req.params.id);

    Blog.getBlogById(id, function(err, blog){
        if (err) {
            return next(err);
        }

        res.render('blog/blog_edite', {title: '编辑blog', blog: blog});
    });
});

router.post('/edite/:id', authMiddleWare.adminRequired, function(req, res, next){
    var id = validator.trim(req.params.id);
    var new_title = validator.trim(req.body.title);
    var new_slug = validator.trim(req.body.slug);
    var new_brief = validator.trim(req.body.brief);
    var new_content = validator.trim(req.body.content);
    var new_content_html = validator.trim(req.body['blogContentEdite-html-code']);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('edite_err', function(status, msg){
        res.status(status);
        res.render('blog/blog_edite', { title: '编辑blog', error: msg, blog:{title: new_title, slug: new_slug, brief: new_brief, content: new_content}});
    });

    if(!new_title){
        return ep.emit('edite_err', 422, '文章标题不能为空');
    }
    if(!new_slug){
        return ep.emit('edite_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(new_slug)) {
        return ep.emit('edite_err', 422, 'slug含有不允许的字符');
    }
    if(!new_brief){
        return ep.emit('edite_err', 422, '简介不能为空');
    }
    if (!new_content) {
        return ep.emit('edite_err', 422, '内容不能为空');
    }

    Blog.getBlogsByQuery({'$or':[{'title': new_title},{'slug': new_slug}]},{},
        function(err, blogs){
            if (err) {
                return next(err);
            }

            if (blogs.length > 0) {
                for(i=0; i< blogs.length; i++){
                    if (blogs[i]._id != id) {
                       ep.emit('edite_err', 422, '文章标题或slug已被占用');
                       break;
                    }
                }
            }

            Blog.updateById(id, new_title, new_slug, new_brief, new_content, new_content_html, function(err){
                if (err) {
                    return next(err);
                }
                res.redirect('/blog/'+new_slug);
            });
        }
    );
});


/**
 * url: /blog/category
 * blog分类列表
 */
router.get('/category', function(req, res, next){
    BlogCategory.getAllCategorys(function(err, categorys){
        if (err) {
            return next(err);
        }
        res.render('blog/category', {categorys: categorys, title:'blog分类列表'});
    });
});


/**
 * url: /blog/category/add
 * blog分类 编辑页
 * 需要管理员权限
 */
router.get('/category/add', authMiddleWare.adminRequired, function(req, res, next){
    res.render('blog/category_add', {title: '添加分类', error:''});
});

router.post('/category/add', authMiddleWare.adminRequired, function(req, res, next){
    var name = validator.trim(req.body.name);
    var slug = validator.trim(req.body.slug);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);
        res.render('blog/category_add', { title: '添加分类', error: msg, name: name, slug: slug});
    });

    if(!name){
        return ep.emit('add_err', 422, '分类名称不能为空');
    }
    if(!slug){
        return ep.emit('add_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(slug)) {
        return ep.emit('add_err', 422, 'slug含有不允许的字符');
    }

    BlogCategory.getCategorysByQuery({'$or':[{'name': name},{'slug': slug}]},{},
        function(err, categorys){
            if (err) {
                return next(err);
            }

            if (categorys.length > 0) {
                return ep.emit('add_err', 422, '分类名或slug已被占用');
            }

            BlogCategory.newAndSave(name, slug, function(err){
                if (err) {
                    return next(err);
                }
                return ep.emit('add_err', 200, '新的分类已成功创建');
            });
        }
    );
});

module.exports = router;