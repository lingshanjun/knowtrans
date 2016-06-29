var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next){
    res.redirect('/sign/signin');
});

/**
 * url: /sign/signin
 * 登录页
 */
router.get('/signin', function(req, res, next) {
    res.render('sign/signin', { title: '登录' });
});

/**
 * url: /sign/signup
 * 注册页
 */
router.get('/signup', function(req, res, next) {
    res.render('sign/signup', { title: '注册' });
});

module.exports = router;
