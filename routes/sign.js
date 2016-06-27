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
  res.send('这里是登录页');
});

/**
 * url: /sign/signup
 * 注册页
 */
router.get('/signup', function(req, res, next) {
  res.send('这里是注册页');
});

module.exports = router;
