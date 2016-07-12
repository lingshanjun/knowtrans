var express = require('express');
var router = express.Router();
var authMiddleWare = require('../middlewares/auth');
var User  = require('../proxy/user');

/**
 * url: /users
 * 获取所有用户列表
 * 需要管理员权限
 */
router.get('/', authMiddleWare.adminRequired, function(req, res, next) {
    User.getAllUsers(function(err, users){
        if (err) {
            return next(err);
        }
        res.render('user/users', {users: users, title:'用户列表'});
        // res.send(users);
    });
});

module.exports = router;
