// 获取当前请求路径的导航结构
exports.navUrl = function(req, res, next) {
    res.locals.nav = {
        'baseUrl': req.baseUrl ? req.baseUrl : '/',
        'subUrl': req.path ? req.path : '/'
    };

    next();
}