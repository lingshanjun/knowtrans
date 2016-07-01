var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'KnowTrans-To Know And To Transmit', messages: req.flash('messages')});
});

module.exports = router;
