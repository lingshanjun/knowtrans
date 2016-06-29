var express = require('express');
var router = express.Router();

router.get('/a', function(req, res, next){
    req.flash('m', 'his');
    res.redirect('/');
});

/* GET home page. */
router.get('/', function(req, res, next) {
    
    res.render('index', { title: 'KnowTrans-To Know And To Transmit' , m:req.flash('m')});
});

module.exports = router;
