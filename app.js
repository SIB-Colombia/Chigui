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
var hierarchy = require('./routes/hierarchyRoutes');
var brief_description = require('./routes/briefDescriptionRoutes');
var molecular_data = require('./routes/molecularData');
var migratory = require('./routes/migratory');
var ecological_significance = require('./routes/ecologicalSignificance');
var environmental_envelope = require('./routes/environmentalEnvelope');

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
//---for elements
//app.use('/base-elements', base_elements);
app.post('/fichas/:id_record/taxon_record_name/', taxon_record_name.postVersion);
app.post('/fichas/taxon_record_name/', taxon_record_name.postRecord);
app.get('/fichas/:id_record/taxon_record_name/:version', taxon_record_name.getVersion);
app.post('/fichas/:id_record/synonyms_atomized/', synonyms_atomized.postVersion);
app.get('/fichas/:id_record/synonyms_atomized/:version', synonyms_atomized.getVersion);
app.post('/fichas/:id_record/common_names_atomized/', common_names_atomized.postVersion);
app.get('/fichas/:id_record/common_names_atomized/:version', common_names_atomized.getVersion);
app.post('/fichas/:id_record/hierarchy/', hierarchy.postVersion);
app.get('/fichas/:id_record/hierarchy/:version', hierarchy.getVersion);
app.post('/fichas/:id_record/brief_description/', brief_description.postVersion);
app.get('/fichas/:id_record/brief_description/:version', brief_description.getVersion);
app.post('/fichas/:id_record/identification_keys/', identification_keys.postVersion);
app.get('/fichas/:id_record/identification_keys/:version', identification_keys.getVersion);
app.post('/fichas/:id_record/molecular_data/', molecular_data.postVersion);
app.get('/fichas/:id_record/molecular_data/:version', molecular_data.getVersion);
app.post('/fichas/:id_record/migratory/', migratory.postVersion);
app.get('/fichas/:id_record/migratory/:version', migratory.getVersion);
app.post('/fichas/:id_record/ecological_significance/', ecological_significance.postVersion);
app.get('/fichas/:id_record/ecological_significance/:version', ecological_significance.getVersion);
app.post('/fichas/:id_record/environmental_envelope/', environmental_envelope.postVersion);
app.get('/fichas/:id_record/environmental_envelope/:version', environmental_envelope.getVersion);






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
