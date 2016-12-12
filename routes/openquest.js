var express = require('express');
var router = express.Router();
var validator = require('validator');
var eventproxy = require('eventproxy');
var validate = require('../common/validate');
var LabModel = require('../models/lab');
var paginate = require('express-paginate');
var _ = require('underscore');

/**
 * URL: /openquest
 */
router.get('/', function(req, res, next) {
    return res.end('open quest')
});

router.post('/', function(req, res, next) {
    console.log(req.body);
    return res.end('open quest post')
});

module.exports = router;