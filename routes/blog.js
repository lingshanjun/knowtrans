var express = require('express');
var router = express.Router();
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
 * blog分类页
 */
router.get('/category', function(req, res, next){
    res.send('this is blog category list');
});


/**
 * url: /blog/category/add
 * blog分类 编辑页
 */
router.get('/category/add', function(req, res, next){
    res.send('blog category add get');
});

router.post('/category/add', function(req, res, next){
    BlogCategory.newAndSave('test2', 'test-2', function(err){
        if (err) {
            return next(err);
        }
        res.send('blog category add post');
    });
});

module.exports = router;