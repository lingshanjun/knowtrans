var express = require('express');
var router = express.Router();
var User = require('../proxy/user');
var validator = require('validator');
var eventproxy = require('eventproxy');
var authMiddleWare = require('../middlewares/auth');
var validate = require('../common/validate');
var encpass = require('../common/encpass');
var config = require('../config');

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

router.post('/signin', function(req, res, next) {
    var loginname = validator.trim(req.body.loginname);
    var password = validator.trim(req.body.password);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('signin_err', function(status, msg){
        res.status(status);
        res.render('sign/signin', { error: msg , title:'登录', loginname:loginname});
    });

    if (!loginname || !password) {
        ep.emit('signin_err', 422, '信息不完整');
        return;
    }

    var getUser;
    if (validator.isEmail(loginname)) {
        getUser = User.getUserByMail;
    }else {
        getUser = User.getUserByName;
    }

    getUser(loginname, function (err, user) {

        if (err) {
            return next(err);
        }

        if (!user) {
            return ep.emit('signin_err', 403, '账户不存在');
        }

        var passhash = user.password;
        encpass.bcompare(password, passhash, ep.done(function (bool) {

            if (!bool) {
                return ep.emit('signin_err', 403, '用户名或密码错误');
            }
            if (!user.active) {
                // 重新发送激活邮件
                // mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
                return ep.emit('signin_err', 403, '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。');
            }
            // store session cookie
            authMiddleWare.gen_session(user, res);
            //check at some page just jump to home page
            // var refer = req.session._loginReferer || '/';
            // for (var i = 0, len = notJump.length; i !== len; ++i) {
            //     if (refer.indexOf(notJump[i]) >= 0) {
            //         refer = '/';
            //         break;
            //     }
            // }
            res.redirect('/');
        }));
    });
});

/**
 * url: /sign/signup
 * 注册页
 */
router.get('/signup', function(req, res, next) {
    res.render('sign/signup', { title: '注册' });
});

router.post('/signup', function(req, res, next) {
    var name = validator.trim(req.body.name).toLowerCase();
    var email = validator.trim(req.body.email).toLowerCase();
    var password = validator.trim(req.body.password);
    var rePassword = validator.trim(req.body.re_password);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('signup_err', function (msg) {
        res.status(422);
        res.render('sign/signup', {error: msg, name: name, email: email, title:"注册"});
    });

    // 验证信息的正确性
    if ([name, password, rePassword, email].some(function (item) { return item === ''; })) {
        ep.emit('signup_err', '信息不完整。');
        return;
    }
    if (name.length < 6) {
        ep.emit('signup_err', '用户名至少需要6个字符');
        return;
    }
    if (name.length > 32) {
        ep.emit('signup_err', '用户名最多为32个字符');
        return;
    }
    if (!validate.validateUserName(name)) {
        return ep.emit('signup_err', '用户名不合法');
    }
    if (!validator.isEmail(email)) {
        return ep.emit('signup_err', '邮箱不合法');
    }
    if (password.length < 8) {
        return ep.emit('signup_err', '密码长度至少为8位');
    }
    if (password !== rePassword) {
        return ep.emit('signup_err', '两次密码输入不一致');
    }

    User.getUsersByQuery({'$or':[{'name': name},{'email': email}]},{},
        function (err, users) {
            if (err) {
              return next(err);
            }

            if (users.length > 0) {
              ep.emit('signup_err', '用户名或邮箱已被占用');
              return;
            }

            encpass.bhash(password, ep.done(function (passhash) {

                User.newAndSave(name, passhash, email, function (err) {
                    if (err) {
                        return next(err);
                    }
                    // 发送激活邮件
                    // mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
                    // res.render('sign/signup', {
                    //   success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
                    // });

                    res.redirect('/');
                });
            }));
        }
    );
});

/**
 * url: /sign/signout
 * 退出
 */
router.get('/signout', function(req, res, next){
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    res.redirect('/');
});

module.exports = router;
