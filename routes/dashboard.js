var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');
var Blog  = require('../proxy/blog');
var User  = require('../proxy/user');
var BlogModel = require('../models/blog');
var BlogCategoryModel = require('../models/blog_category');
var UserModel = require('../models/user');
var TransBookModel = require('../models/trans_book');
var TransArticleModel = require('../models/trans_article');
var authMiddleWare = require('../middlewares/auth');
var paginate = require('express-paginate');
var _ = require('underscore');
var encpass = require('../common/encpass');

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
    BlogModel.find({}).populate('categories', '_id name slug').sort('-_id').exec(function(err, result){
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
    var id = req.params.id;

    var ref = ['add', 'delete', 'preview'];
    if ( _.indexOf(ref, id) > -1) {
        next();
        return;
    }

    id = validator.trim(id);
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
    var id = req.params.id;

    var ref = ['add', 'delete', 'preview'];
    if ( _.indexOf(ref, id) > -1) {
        next();
        return;
    }

    var id = validator.trim(id);
    var new_title = validator.trim(req.body.title);
    var new_slug = validator.trim(req.body.slug);
    var new_brief = validator.trim(req.body.brief);
    var new_content = validator.trim(req.body.content);
    var new_content_html = validator.trim(req.body['blogContentEdite-html-code']);
    var new_state = validator.trim(req.body.state);
    var new_views = parseInt(validator.trim(req.body.views));
    var new_categories = req.body.newCategories;
    var new_is_recommend = validator.trim(req.body.is_recommend) == 'true' ? true : false;

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
                       return ep.emit('edite_err', 422, '文章标题或slug已被占用');
                    }
                }
            }

            Blog.updateById(id, new_title, new_slug, new_brief, new_content, new_content_html, new_state, new_views, new_is_recommend, new_categories, function(err){
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
                        return res.json({url: '/dashboard/blog/'});
                    });
                });

            });
        }
    );
});


/**
 * url: /dashboard/blog/add
 * blog添加文章页
 */
router.get('/blog/add', function(req, res, next){
    res.render('dashboard/blog/blog_add', {title: '添加blog', error: '', layout: 'dashboard/default'});
});

router.post('/blog/add', function(req, res, next){
    var title = validator.trim(req.body.title);
    var slug = validator.trim(req.body.slug);
    var brief = validator.trim(req.body.brief);
    var content = validator.trim(req.body.content);
    var content_html = validator.trim(req.body['blogContentEdite-html-code']);
    var state = validator.trim(req.body.state);
    var views = parseInt(validator.trim(req.body.views));
    var categories = req.body.newCategories;
    var is_recommend = validator.trim(req.body.is_recommend) == 'true' ? true : false;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
    });

    if(!title){
        return ep.emit('add_err', 422, '文章标题不能为空');
    }
    if(!slug){
        return ep.emit('add_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(slug)) {
        return ep.emit('add_err', 422, 'slug含有不允许的字符');
    }
    if(!categories){
        return ep.emit('add_err', 422, '没有选择分类');
    }
    if(!brief){
        return ep.emit('add_err', 422, '简介不能为空');
    }
    if (!content) {
        return ep.emit('add_err', 422, '内容不能为空');
    }


    var ep2 = eventproxy.create("getBlogs", "getCategories", function (noblog, objCategories) {
        Blog.newAndSave(title, slug, brief, content, content_html, state, views, is_recommend, objCategories, function(err, blog){
            if (err) {
                return next(err);
            }

            _.each(objCategories, function(item){
                item.blogs.push(blog);
                item.save(function(err){
                    if (err) {
                        return next(err);
                    }
                });
            });
            // res.redirect('/blog');
            res.status(200);
            return res.json({url: '/dashboard/blog/'});
        });
    });
    Blog.getBlogsByQuery({'$or':[{'title': title},{'slug': slug}]},{},
        function(err, blogs){
            if (err) {
                return next(err);
            }

            if (blogs.length > 0) {
                return ep.emit('add_err', 422, '文章标题或slug已被占用');
            }

            ep2.emit('getBlogs', true);
        }
    );
    BlogCategory.getCategoriesByIds(categories, function(err, objCategories){
        if (err) {
            return next(err);
        }
        ep2.emit('getCategories', objCategories);
    });
});


/**
 * url:/dashboard/blog/preview/:slug
 * blog 详情页
 */
router.get('/blog/preview/:slug', function(req, res, next){
    var slug = validator.trim(req.params.slug);

    Blog.getBlogBySlug(slug, function(err, blog){
        if (err) {
            return next(err);
        }

        blog.create_at_ago = blog.create_at_ago();

        // blog.content = marked(blog.content); //将markdown解析为html
        res.render('blog/blog_detail', {title: blog.title, blog: blog});
    });

});


/**
 * url: /dashboard/blog/delete/id
 * blog 删除
 */
router.post('/blog/delete/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    Blog.removeById(id, function(err){
        if (err) {
            return next(err);
        }
        BlogCategoryModel.update({'blogs': id}, {$pull: {'blogs': id}}, {multi: true}, function(err){
            if (err) {
                return next(err);
            }
            res.status(200);
            return res.json({ message: "删除成功"});
        });
    });
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
 * url: /dashboard/category/:id
 * blog分类 编辑页
 */
router.get('/category/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    BlogCategoryModel.findOne({'_id': id}).exec(function(err, category){
        if (err) {
            return next(err);
        }

        res.render('dashboard/category/category_edite', {title: '编辑分类', category: category, layout: 'dashboard/default'});
    });
});

router.post('/category/:id', function(req, res, next){
    var id = validator.trim(req.params.id);
    var new_name = validator.trim(req.body.name);
    var new_slug = validator.trim(req.body.slug);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('edite_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
    });

    if(!new_name){
        return ep.emit('edite_err', 422, '分类名称不能为空');
    }
    if(!new_slug){
        return ep.emit('edite_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(new_slug)) {
        return ep.emit('edite_err', 422, 'slug含有不允许的字符');
    }

    BlogCategoryModel.find({'$or':[{'name': new_slug},{'slug': new_slug}]}, '', {},
        function(err, categories){
            if (err) {
                return next(err);
            }

            if (categories.length > 0) {
                for (var i = categories.length - 1; i >= 0; i--) {
                    if (categories[i].id != id) {
                        return ep.emit('edite_err', 422, '分类名或slug已被占用');
                    }
                }
            }

            BlogCategoryModel.update(
                {'_id': id},
                {$set:{
                        'name': new_name,
                        'slug': new_slug,
                        'update_at': new Date()
                    }
                },
                function(err, category){
                    if (err) {
                        return next(err);
                    }

                    res.status(200);
                    return res.json({url: '/dashboard/category'});
                }
            );
        }
    );
});


/**
 * url: /dashboard/category/delete/id
 * blog分类 删除
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


/**
 * url: /dashboard/category/:id/blogs
 * blog某分类下的所有文章
 */
router.get('/category/:id/blogs', function(req, res, next){
    var id = validator.trim(req.params.id);

    BlogCategoryModel.
        findOne({'_id': id}).
        populate({
            path: 'blogs',
            populate: {
                path: 'categories'
            }
        }).
        exec(function(err, category){
            if (err) {
                return next(err);
            }

            res.render('dashboard/blog/blog_list', {
                title:'blog分类列表',
                blogs: category.blogs,
                layout: 'dashboard/default'
            });
        });
 });


/*******************************user相关操作************************************/


/**
 * url: /dashboard/users
 * 获取所有用户列表
 */
router.get('/user', function(req, res, next) {
    User.getAllUsers(function(err, users){
        if (err) {
            return next(err);
        }
        res.render('dashboard/user/user_list', {users: users, title:'用户列表', layout: 'dashboard/default'});
    });
});


/**
 * url: /dashboard/user/add
 * user 新增页
 */
router.get('/user/add', function(req, res, next){
    res.render('dashboard/user/user_add', {title: '添加用户', error: '', layout: 'dashboard/default'});
});

router.post('/user/add', function(req, res, next){
    var name = validator.trim(req.body.name);
    var email = validator.trim(req.body.email);
    var password = '12345678';    // 新增用户默认密码

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);
        return res.render('dashboard/user/user_add', { title: '添加分类', error: msg, name: name, email: email, layout: 'dashboard/default'});
    });

    if ([name, email].some(function (item) { return item === ''; })) {
        ep.emit('add_err', 422, '信息不完整。');
        return;
    }
    if (name.length < 6) {
        ep.emit('add_err', 422, '用户名至少需要6个字符');
        return;
    }
    if (name.length > 32) {
        ep.emit('add_err', 422, '用户名最多为32个字符');
        return;
    }
    if (!validate.validateUserName(name)) {
        return ep.emit('add_err', 422, '用户名不合法');
    }
    if (!validator.isEmail(email)) {
        return ep.emit('add_err', 422, '邮箱不合法');
    }

    User.getUsersByQuery({'$or':[{'name': name},{'email': email}]},{},
        function (err, users) {
            if (err) {
              return next(err);
            }

            if (users.length > 0) {
              ep.emit('add_err', 422, '用户名或邮箱已被占用');
              return;
            }

            encpass.bhash(password, ep.done(function (passhash) {

                User.newAndSave(name, passhash, email, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/dashboard/user');
                });
            }));
        }
    );
});


/**
 * url: /dashboard/user/:id
 * blog分类 编辑页
 */
router.get('/user/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    UserModel.findOne({'_id': id}).exec(function(err, user){
        if (err) {
            return next(err);
        }

        res.render('dashboard/user/user_edite', {title: '编辑用户', user: user, layout: 'dashboard/default'});
    });
});

router.post('/user/:id', function(req, res, next){
    var id = validator.trim(req.params.id);
    var new_name = validator.trim(req.body.name);
    var new_email = validator.trim(req.body.email);
    var new_is_admin = validator.trim(req.body.is_admin) == 'true' ? true : false;
    var new_is_active = validator.trim(req.body.is_active) == 'true' ? true : false;
    var new_is_block = validator.trim(req.body.is_block) == 'true' ? true : false;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('edite_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
    });

    if ([new_name, new_email].some(function (item) { return item === ''; })) {
        ep.emit('edite_err', 422, '信息不完整。');
        return;
    }
    if (new_name.length < 6) {
        ep.emit('edite_err', 422, '用户名至少需要6个字符');
        return;
    }
    if (new_name.length > 32) {
        ep.emit('edite_err', 422, '用户名最多为32个字符');
        return;
    }
    if (!validate.validateUserName(new_name)) {
        return ep.emit('edite_err', 422, '用户名不合法');
    }
    if (!validator.isEmail(new_email)) {
        return ep.emit('edite_err', 422, '邮箱不合法');
    }

    User.getUsersByQuery({'$or':[{'name': new_name},{'email': new_email}]},{},
        function (err, users) {
            if (err) {
              return next(err);
            }

            if (users.length > 0) {
                for (var i = users.length - 1; i >= 0; i--) {
                    if (users[i].id != id) {
                        return ep.emit('edite_err', 422, '用户名或邮箱已被占用');
                    }
                }
            }

            User.updateById(
                id,
                {
                    'name': new_name,
                    'email': new_email,
                    'is_admin': new_is_admin,
                    'is_active': new_is_active,
                    'is_block': new_is_block,
                    'update_at': new Date()
                },
                function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.status(200);
                    return res.json({url: '/dashboard/user'});
                }
            );
        }
    );
});


/**
 * url: /dashboard/user/delete/id
 *用户 删除
 */
router.post('/user/delete/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    UserModel.remove({'_id': id}).exec(function(err){
        if (err) {
            return next(err);
        }

        res.status(200);
        return res.json({ message: "删除成功"});
    });
});


/*******************************transbook相关操作************************************/
/**
 * url: /dashboard/trans/book
 * transbook列表
 */
router.get('/trans/book', function(req, res, next){
    TransBookModel.find({}).exec(function(err, books){
        if (err) {
            return next(err);
        }

        if (req.headers['content-type'] == 'json') {
            return res.json(categories);
        }

        res.render('dashboard/trans/transbook_list', {books: books, title:'transbook列表', layout: 'dashboard/default'});
    });
});


/**
 * url: /dashboard/trans/book/add
 * transbook 新增页
 */
router.get('/trans/book/add', function(req, res, next){
    res.render('dashboard/trans/transbook_add', {title: '添加book', error: '', layout: 'dashboard/default'});
});

router.post('/trans/book/add', function(req, res, next){
    var name = validator.trim(req.body.name);
    var slug = validator.trim(req.body.slug);
    var version = validator.trim(req.body.version);
    var brief = validator.trim(req.body.brief);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);

        if (req.headers['content-type'] == 'application/json'){
            return res.json({message: msg});
        }

        return res.render('dashboard/trans/transbook_add', { title: '添加book', error: msg, name: name, slug: slug, version: version, brief: brief, layout: 'dashboard/default'});
    });

    if(!name){
        return ep.emit('add_err', 422, 'book名称不能为空');
    }
    if(!slug){
        return ep.emit('add_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(slug)) {
        return ep.emit('add_err', 422, 'slug含有不允许的字符');
    }
    if(!version){
        return ep.emit('add_err', 422, '版本不能为空');
    }
    if(!brief){
        return ep.emit('add_err', 422, '简介不能为空');
    }

    TransBookModel.find({'$or': [{'name': name}, {'slug': slug}]}).exec(function(err, books){
        if (err) {
            return next(err);
        }

        if (books.length > 0) {
            return ep.emit('add_err', 422, 'book名称或slug已被占用')
        }

        var book = new TransBookModel();
        book.name = name;
        book.slug = slug;
        book.version = version;
        book.brief = brief;

        book.save(function(err, book){
            if (err) {
                return next(err);
            }

            if (req.headers['content-type'] == 'application/json') {
                return res.json(book);
            }

            return res.redirect('/dashboard/trans/book');
        });
    });
});


/**
 * url: /dashboard/trans/book/:id
 * transbook 编辑页
 */
router.get('/trans/book/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    TransBookModel.findOne({'_id': id}).exec(function(err, book){
        if (err) {
            return next(err);
        }

        res.render('dashboard/trans/transbook_edite', {title: '编辑transbook', book: book, layout: 'dashboard/default'});
    });
});

router.post('/trans/book/:id', function(req, res, next){
    var id = validator.trim(req.params.id);
    var new_name = validator.trim(req.body.name);
    var new_slug = validator.trim(req.body.slug);
    var new_version = validator.trim(req.body.version);
    var new_brief = validator.trim(req.body.brief);

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('edite_err', function(status, msg){
        res.status(status);
        return res.json({message: msg});
    });

    if(!new_name){
        return ep.emit('edite_err', 422, 'book名称不能为空');
    }
    if(!new_slug){
        return ep.emit('edite_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(new_slug)) {
        return ep.emit('edite_err', 422, 'slug含有不允许的字符');
    }
    if(!new_version){
        return ep.emit('edite_err', 422, '版本不能为空');
    }
    if(!new_brief){
        return ep.emit('edite_err', 422, '简介不能为空');
    }

    TransBookModel.find({'$or':[{'name': new_slug},{'slug': new_slug}]}, '', {},
        function(err, books){
            if (err) {
                return next(err);
            }

            if (books.length > 0) {
                for (var i = books.length - 1; i >= 0; i--) {
                    if (books[i].id != id) {
                        return ep.emit('edite_err', 422, 'book名称或slug已被占用');
                    }
                }
            }

            TransBookModel.update(
                {'_id': id},
                {$set:{
                        'name': new_name,
                        'slug': new_slug,
                        'version': new_version,
                        'brief': new_brief,
                        'update_at': new Date()
                    }
                },
                function(err, book){
                    if (err) {
                        return next(err);
                    }

                    res.status(200);
                    return res.json({url: '/dashboard/trans/book'});
                }
            );
        }
    );
});


/**
 * url: /dashboard/trans/book/delete/id
 * transbook 删除
 */
router.post('/trans/book/delete/:id', function(req, res, next){
    var id = validator.trim(req.params.id);

    TransBookModel.remove({'_id': id}).exec(function(err){
        if (err) {
            return next(err);
        }
        /*BlogModel.update({'categories': id}, {$pull: {'categories': id}}, { multi: true }, function(err){
            if (err) {
                return next(err);
            }

            res.status(200);
            return res.json({ message: "删除成功"});
        });*/

        res.status(200);
        return res.json({ message: "删除成功"});
    });
});


/*******************************transarticle相关操作************************************/
/**
 * url: /dashboard/trans/article
 * transarticle列表
 */
router.get('/trans/article', function(req, res, next){
    TransArticleModel.find({}).exec(function(err, articles){
        if (err) {
            return next(err);
        }

        if (req.headers['content-type'] == 'json') {
            return res.json(articles);
        }

        res.render('dashboard/trans/transarticle_list', {articles: articles, title:'transarticle列表', layout: 'dashboard/default'});
    });
});


/**
 * url: /dashboard/trans/article/add
 * transarticle 新增页
 */
router.get('/trans/article/add', function(req, res, next){
    res.render('dashboard/trans/transarticle_add', {title: '添加article', error: '', layout: 'dashboard/default'});
});

router.post('/trans/article/add', function(req, res, next){
    var title = validator.trim(req.body.title);
    var slug = validator.trim(req.body.slug);
    var order = validator.trim(req.body.order);
    var is_locked = validator.trim(req.body.is_locked) === 'true' ? true: false;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('add_err', function(status, msg){
        res.status(status);

        if (req.headers['content-type'] == 'application/json'){
            return res.json({message: msg});
        }

        return res.render('dashboard/trans/transarticle_add', { title: '添加article', error: msg, article: {title: title, slug: slug, order: order, is_locked: is_locked}, layout: 'dashboard/default'});
    });

    if(!title){
        return ep.emit('add_err', 422, 'article名称不能为空');
    }
    if(!slug){
        return ep.emit('add_err', 422, 'slug不能为空');
    }
    if (!validate.validateSlug(slug)) {
        return ep.emit('add_err', 422, 'slug含有不允许的字符');
    }
    if(!order){
        return ep.emit('add_err', 422, '排序不能为空');
    }

    order = parseInt(order);

    TransArticleModel.find({'$or': [{'title': title}, {'slug': slug}, {'order': order}]}).exec(function(err, articles){
        if (err) {
            return next(err);
        }

        if (articles.length > 0) {
            return ep.emit('add_err', 422, 'article名称或slug或order已被占用');
        }

        var article = new TransArticleModel();
        article.title = title;
        article.slug = slug;
        article.order = order;
        article.is_locked = is_locked;

        article.save(function(err, article){
            if (err) {
                return next(err);
            }

            if (req.headers['content-type'] == 'application/json') {
                return res.json(article);
            }

            return res.redirect('/dashboard/trans/article');
        });
    });
});


module.exports = router;
