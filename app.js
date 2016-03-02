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
//------
var synonyms_atomized = require('./routes/synonymsAtomizedRoutes');
var taxon_record_name = require('./routes/taxonRecordNameRoutes');
var common_names_atomized = require('./routes/commonNamesAtomizedRoutes');
var identification_keys = require('./routes/identificationKeysRoutes');

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
//---for elements
//app.use('/base-elements', base_elements);
app.use('/synonyms_atomized', synonyms_atomized);
app.use('/taxon_record_name', taxon_record_name);
app.use('/common_names_atomized', common_names_atomized);
//app.use('/identification_keys', identification_keys);
console.log("THE KEYS: "+Object.keys(identification_keys));
app.post('/fichas/:id_record/identification_keys/', identification_keys.getVersion);




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
