var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var LabModel = require('../models/lab');
var paginate = require('express-paginate');
var _ = require('underscore');

/**
 * url: /lab
 * lab列表页
 */
router.get('/', function(req, res, next){

    LabModel.paginate(
        {},
        {sort: '-_id', page: req.query.page, limit: req.query.limit },
        function(err, result){
            if (err) {
                return next(err);
            }

            var curPage = res.locals.paginate.page;
            var limit = res.locals.paginate.limit;
            var pages = paginate.getArrayPages(req)(3, result.pages, curPage);
            var hasPreviousPages = curPage > 1;
            var hasNextPages = curPage < result.pages;
            var prevUrl = '', nextUrl = '';

            if (hasPreviousPages && pages.length) {
                prevUrl = pages[0].url.replace(/page=(\d)+/i, 'page='+(curPage-1));
            }
            if (hasNextPages && pages.length) {
                nextUrl = pages[0].url.replace(/page=(\d)+/i, 'page='+(curPage+1));
            }

            pagination = {
                pageCount: result.pages,
                itemCount: result.total,
                curPage: curPage,
                limit: limit,
                hasPreviousPages: hasPreviousPages,
                hasNextPages: hasNextPages,
                prevUrl: prevUrl,
                nextUrl: nextUrl,
                pages: pages
            }

            res.render('lab/lab', {
                title:'lab列表',
                labs: result.docs,
                pagination: pagination
            });
        }
    );
});


/**
 * url:/lab/slug
 * lab 详情页
 */
router.get('/:slug', function(req, res, next){
    var slug = validator.trim(req.params.slug);

    LabModel.findOne({'slug': slug}).exec(function(err, lab){
        if (err) {
            return next(err);
        }

        lab.create_at_ago = lab.create_at_ago();

        res.render('lab/lab_detail', {title: lab.name, lab: lab});
    });
});


module.exports = router;