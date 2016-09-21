if(process.env.NODE_ENV ==  'production'){
  require('dotenv').load();
}

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var passport = require('passport');
var paginate = require('express-paginate');

require('./routes/helper');
var home = require('./routes/index');
var sign = require('./routes/sign');
var blog = require('./routes/blog');
var category = require('./routes/category');
var lab = require('./routes/lab');
var util = require('./routes/util');
var dashboard = require('./routes/dashboard');

var config = require('./config');
var auth = require('./middlewares/auth');
var navurl = require('./middlewares/navurl');

var app = express();

// db config

/*mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/kt', {}, function(err){
  if(err){
    console.log('mongo connect err ');
    console.log(err);
    process.exit(1);
  }
});*/

mongoose.connect('mongodb://localhost/kt', {}, function(err){
  if(err){
    console.log('mongo connect err ');
    console.log(err);
    process.exit(1);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// resister hbs partials
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: config.database.cookieSecret,
  key: config.database.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24},//1 days
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

app.use(paginate.middleware(10, 50)); // 分页

// custom middleware
app.use(auth.authUser);
// app.use(auth.blockUser());
// app.use(navurl.navUrl);

app.use('/', navurl.navUrl, home);
app.use('/sign', sign);
app.use('/blog', navurl.navUrl, blog);
app.use('/category', navurl.navUrl, category);
app.use('/lab', navurl.navUrl, lab);
app.use('/util', util);
app.use('/dashboard', navurl.navUrl, auth.adminRequired, dashboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
