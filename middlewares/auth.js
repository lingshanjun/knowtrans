var config = require('../config');
var eventproxy = require('eventproxy');
var User = require('../proxy/user');

// 生成登录的cookie
exports.gen_session = function(user, res) {

    var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
    var opts = {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        signed: true,
        httpOnly: true
    };
    res.cookie(config.auth_cookie_name, auth_token, opts); //cookie 有效期7天
}

// 验证用户是否登录
exports.authUser = function (req, res, next) {

    var ep = new eventproxy();
    ep.fail(next);

    // Ensure current_user always has defined.
    res.locals.current_user = null;

    ep.all('get_user', function (user) {

        if (!user) {
            return next();
        }

        user = res.locals.current_user = req.session.user = user;

        next();
        // if (config.admins.hasOwnProperty(user.loginname)) {
        //     user.is_admin = true;
        // }

        // Message.getMessagesCount(user._id, ep.done(function (count) {
        //     user.messages_count = count;
        //     next();
        // }));
    });

    if (req.session.user) {
        ep.emit('get_user', req.session.user);
    } else {

        var auth_token = req.signedCookies[config.auth_cookie_name];
        if (!auth_token) {
            return next();
        }

        var auth = auth_token.split('$$$$');
        var user_id = auth[0];
        User.getUserById(user_id, ep.done('get_user'));
    }
};
