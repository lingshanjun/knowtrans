var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');

/**
 * url: /blog
 * blog列表页
 */
router.get('/', function(req, res, next){
    res.send('blog list');
});


/**
 * url: /blog/add
 * blog编辑页
 */
router.get('/add', function(req, res, next){
    res.send('blog add get');
});

router.post('/add', function(req, res, next){
    res.send('blog add post');
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
 */
router.get('/category/add', function(req, res, next){
    res.render('blog/category_add', {title: '添加分类', error:''});
});

router.post('/category/add', function(req, res, next){
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