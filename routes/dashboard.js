var express = require('express');
var router = express.Router();

/**
 * 都以dashboard为前缀总路径
 */

router.get('/', function(req, res, next){
    res.render('dashboard/index', {layout: '/dashboard/default'});
});

module.exports = router;
