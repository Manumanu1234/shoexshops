var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require("express-handlebars")
var db=require('./config/connection')
var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var session=require("express-session")
 
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));

var handlebarsInstance = hbs.create({
  extname: 'hbs',
  defaultLayout: 'layouts',
  layoutsDir:path.join(__dirname,'views/layouts'),
  partialsDir:path.join(__dirname,'views/partials'),
  helpers: {
    inc: function(value, options){
      return parseInt(value) + 1;
    }
  }
});


app.engine('hbs',handlebarsInstance.engine);

db.connect()
    .then(() => {
        console.log("Connected to the database:");
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
    });
    app.use(session({secret:"key",cookie:{maxAge:60000}}))




app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

