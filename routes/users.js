var express = require('express');
var router = express.Router();
var validator = require('validator');
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

/**
 * url: /users/active/:id
 * 激活某用户--强制激活，不需要邮箱验证
 * 需要管理员权限
 */
router.post('/active/:id', authMiddleWare.adminRequired, function(req, res, next) {
    var id = validator.trim(req.params.id);

    User.getUserById(id, function(err, user){
        if (err) {
            return next(err);
        }
        if (user.is_active){
            return res.json({ message: "已激活，不必再激活", code:304 });
        }

        User.updateById(id, {'is_active': true}, function(err){
            if (err) {
                return next(err);
            }
            return res.json({ message: "激活成功", code:200});
        });
    });
});

/**
 * url: /users/deactive/:id
 * 冻结某用户--强制非激活，不需要邮箱验证
 * 需要管理员权限
 */
router.post('/deactive/:id', authMiddleWare.adminRequired, function(req, res, next) {
    var id = validator.trim(req.params.id);

    User.getUserById(id, function(err, user){
        if (err) {
            return next(err);
        }
        if (!user.is_active){
            return res.json({ message: "已冻结，不必再冻结", code:304 });
        }

        User.updateById(id, {'is_active': false}, function(err){
            if (err) {
                return next(err);
            }
            return res.json({ message: "冻结成功", code:200});
        });
    });
});

module.exports = router;
