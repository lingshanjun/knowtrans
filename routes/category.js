var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var BlogCategory  = require('../proxy/blog_category');
var Blog  = require('../proxy/blog');
var BlogModel = require('../models/blog');
var BlogCategoryModel = require('../models/blog_category');
var paginate = require('express-paginate');
var _ = require('underscore');
var moment = require('moment');


/**
 * url: /category
 * blog分类列表
 */
router.get('/', function(req, res, next){
    BlogCategoryModel.find({}).exec(function(err, categories){
        if (err) {
            return next(err);
        }

        return res.json(categories);

    });
});


module.exports = router;