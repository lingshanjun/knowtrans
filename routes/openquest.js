var express = require('express');
var router = express.Router();
var validator = require('validator');
// var eventproxy = require('eventproxy');
// var validate = require('../common/validate');
var OpenQuest = require('../models/open_quest');
var paginate = require('express-paginate');
// var _ = require('underscore');

/**
 * URL: /openquest
 * openquest列表页
 */
router.get('/', function(req, res, next) {
    OpenQuest.paginate({}, {
            sort: '-_id',
            page: req.query.page,
            limit: req.query.limit
        },
        function(err, result) {
            if (err) {
                return next(err);
            }

            var curPage = res.locals.paginate.page;
            var limit = res.locals.paginate.limit;
            var pages = paginate.getArrayPages(req)(3, result.pages, curPage);
            var hasPreviousPages = curPage > 1;
            var hasNextPages = curPage < result.pages;
            var prevUrl = '',
                nextUrl = '';

            if (hasPreviousPages && pages.length) {
                prevUrl = pages[0].url.replace(/page=(\d)+/i, 'page=' + (curPage - 1));
            }
            if (hasNextPages && pages.length) {
                nextUrl = pages[0].url.replace(/page=(\d)+/i, 'page=' + (curPage + 1));
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
            };
            res.render('openquest/open_quest', {
                title: '开源探秘',
                repos: result.docs,
                pagination: pagination
            });
        }
    );
});


/**
 * URL: /openquest
 * github webhooks git push提交内容
 */
router.post('/', function(req, res, next) {
    var repo_name = req.body.repository.name;
    var repo_fullname = req.body.repository.fullname;
    var repo_url = req.body.repository.url;
    var repo_id = req.body.repository.id;
    var repo_description = req.body.repository.description;
    var update_at = req.body.head_commit.timestamp;
    var head_commit_id = req.body.head_commit.id;

    OpenQuest.findOne({
        'repo_name': repo_name
    }).exec(function(err, repo) {
        if (err) {
            return next(err);
        }

        if (repo) {
            if (repo.head_commit_id === head_commit_id) {
                return res.end('Does not update');
            } else {

                OpenQuest.update({
                        'repo_name': repo_name
                    }, {
                        $set: {
                            'update_at': update_at,
                            'head_commit_id': head_commit_id
                        }
                    },
                    function(err, result) {
                        if (err) {
                            return next(err);
                        }

                        return res.end('Updates');
                    }
                );
            }
        } else {
            var new_repo = new OpenQuest();
            new_repo.repo_name = repo_name;
            new_repo.repo_fullname = repo_fullname;
            new_repo.repo_url = repo_url;
            new_repo.repo_id = repo_id;
            new_repo.repo_description = repo_description;
            new_repo.head_commit_id = head_commit_id;
            new_repo.update_at = update_at;

            new_repo.save(function(err, nresult) {
                if (err) {
                    return next(err);
                }

                return res.end('Add new repo');
            });
        }
    });
});

module.exports = router;