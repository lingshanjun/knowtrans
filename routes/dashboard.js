var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');
var Blog  = require('../proxy/blog');
var BlogModel = require('../models/blog');
var BlogCategoryModel = require('../models/blog_category');
var authMiddleWare = require('../middlewares/auth');
var paginate = require('express-paginate');
var _ = require('underscore');

/**
 * 都以dashboard为前缀总路径
 */

router.get('/', function(req, res, next){
    res.redirect('/dashboard/blog');
});

/*******************************blog相关操作************************************/

/**
 * url: /dashboard/blog
 * blog列表页
 */
router.get('/blog', function(req, res, next){
    BlogModel.find({}).populate('categories', '_id name slug').exec(function(err, result){
        if (err) {
            return next(err);
        }
        res.render('dashboard/blog/blog_list', {
            title:'blog分类列表',
            blogs: result,
            layout: 'dashboard/default'
        });
    })
});


/**
 * url: /dashboard/blog/id
 * blog编辑页
 */
router.get('/blog/:id', function(req, res, next){
    var id = validator.trim(req.params.id);
    var ep = eventproxy.create("getBlog", function (blog, categorys) {
        res.render('dashboard/blog/blog_edite', {title: '编辑blog', blog: blog, layout: 'dashboard/default'});
    });

    BlogModel.findOne({'_id': id}).populate('categories', '_id name slug').exec(function(err, blog){
        if (err) {
            return next(err);
        }
        ep.emit("getBlog", blog);
    });
});

router.post('/blog/:id', function(req, res, next){
    var id = validator.trim(req.params.id);
    var new_title = validator.trim(req.body.title);
    var new_slug = validator.trim(req.body.slug);
    var new_brief = validator.trim(req.body.brief);
    var new_content = validator.trim(req.body.content);
    var new_content_html = validator.trim(req.body['blogContentEdite-html-code']);
    var new_state = validator.trim(req.body.state);
    var new_views = parseInt(validator.trim(req.body.views));
    var new_categories = req.body.newCategories;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('edite_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
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
    if(!new_categories){
        return ep.emit('edite_err', 422, '没有选择分类');
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

            Blog.updateById(id, new_title, new_slug, new_brief, new_content, new_content_html, new_state, new_views, new_categories, function(err){
                if (err) {
                    return next(err);
                }
                BlogCategoryModel.update({'blogs': id}, {$pull: {'blogs': id}}, {multi: true}, function(err){
                    if (err) {
                        return next(err);
                    }

                    BlogCategory.getCategoriesByIds(new_categories, function(err, objCategories){
                        if (err) {
                            return next(err);
                        }
                        _.each(objCategories, function(item){
                            item.blogs.push(id);
                            item.save(function(err){
                                if (err) {
                                    return next(err);
                                }
                            });
                        });

                        res.status(200);
                        return res.json({url: '/blog/'+new_slug});
                    });
                });

            });
        }
    );
});


/*******************************category相关操作************************************/
/**
 * url: /dashboard/category
 * blog分类列表
 */
router.get('/category', function(req, res, next){
    BlogCategoryModel.find({}).exec(function(err, categories){
        if (err) {
            return next(err);
        }

        if (req.headers['content-type'] == 'json') {
            return res.json(categories);
        }

        res.render('dashboard/category/category_list', {categories: categories, title:'blog分类列表', layout: 'dashboard/default'});
    });
});


/**
 * url: /dashboard/category/add
 * blog分类 新增页
 */
router.get('/category/add', function(req, res, next){
    res.render('dashboard/category/category_add', {title: '添加分类', error: '', layout: 'dashboard/default'});
});

router.post('/category/add', function(req, res, next){
    var name = validator.trim(req.body.name);
    var slug = validator.trim(req.body.slug);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);

        if (req.headers['content-type'] == 'application/json'){
            return res.json({message: msg});
        }

        return res.render('dashboard/category/category_add', { title: '添加分类', error: msg, name: name, slug: slug, layout: 'dashboard/default'});
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
        function(err, categories){
            if (err) {
                return next(err);
            }

            if (categories.length > 0) {
                return ep.emit('add_err', 422, '分类名或slug已被占用');
            }

            BlogCategory.newAndSave(name, slug, function(err, blog){
                if (err) {
                    return next(err);
                }

                if (req.headers['content-type'] == 'application/json'){
                    return res.json(blog);
                }

                return res.redirect('/dashboard/category');
            });
        }
    );
});


/**
 * url: /dashboard/category/delete/id
 * blog分类 删除
 * 需要管理员权限
 */
router.post('/category/delete/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    BlogCategory.removeById(id, function(err){
        if (err) {
            return next(err);
        }
        BlogModel.update({'categories': id}, {$pull: {'categories': id}}, { multi: true }, function(err){
            if (err) {
                return next(err);
            }

            res.status(200);
            return res.json({ message: "删除成功"});
        });
    });
});

module.exports = router;
