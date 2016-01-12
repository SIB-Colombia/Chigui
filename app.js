var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');

var routes = require('./routes/index');
var users = require('./routes/users');
var records = require('./routes/getFicha');
var post_records = require('./routes/postFicha');
var list_records = require('./routes/getList');
var update_records = require('./routes/updateFicha');
var tax_reco = require('./routes/taxonRecordNameRoutes');
var syn_ato = require('./routes/synonymsAtomizedRoutes');
//var get_test = require();

var app = express();
app.use(compress());
app.use(bodyParser.json({limit: '5mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


app.use(cors());

//app.use('/', routes);
//app.use('/users', users);
app.use('/get-record', records);
app.use('/post-record', cors(), post_records);
app.use('/get-list', list_records);
app.use('/update-record', cors(), update_records);
app.use('/test', tax_reco);
app.use('/syn_ato', syn_ato);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.205.27:7000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/




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
