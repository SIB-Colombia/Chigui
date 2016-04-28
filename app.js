var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');


//------
var record = require('./routes/recordRoutes');
var more_information = require('./routes/moreInformationRoutes');
var synonyms_atomized = require('./routes/synonymsAtomizedRoutes');
var taxon_record_name = require('./routes/taxonRecordNameRoutes');
var taxon_record_name = require('./routes/taxonRecordNameRoutes');
var common_names_atomized = require('./routes/commonNamesAtomizedRoutes');
var identification_keys = require('./routes/identificationKeysRoutes');
var hierarchy = require('./routes/hierarchyRoutes');
var brief_description = require('./routes/briefDescriptionRoutes');
var abstract = require('./routes/abstractRoutes');
var full_description = require('./routes/fullDescriptionRoutes');
var associated_party = require('./routes/associatedPartyRoutes');
var direct_threats = require('./routes/directThreatsRoutes');
var base_elements = require('./routes/baseElementsRoutes');
var life_form = require('./routes/lifeFormRoutes');
var life_cycle = require('./routes/lifeCycleRoutes');
var reproduction = require('./routes/reproductionRoutes'); 
var annual_cycles = require('./routes/annualCyclesRoutes');
var feeding = require('./routes/feedingRoutes');
var dispersal = require('./routes/dispersalRoutes');
var behavior = require('./routes/behaviorRoutes');
var interactions = require('./routes/interactionsRoutes');
var molecular_data = require('./routes/molecularData');
var migratory = require('./routes/migratory');
var ecological_significance = require('./routes/ecologicalSignificanceRoutes');
var environmental_envelope = require('./routes/environmentalEnvelopeRoutes');
var invasiveness = require('./routes/invasivenessRoutes');
var habitats = require('./routes/habitats');
var distribution = require('./routes/distribution');
var territory = require('./routes/territory');
var population_biology = require('./routes/populationBiology');
var threat_status = require('./routes/threatStatus');
var legislation = require('./routes/legislation');
var uses_management_and_conservation = require('./routes/usesManagementAndConservationRoutes');
var ancillary_data = require('./routes/ancillaryData');
var references = require('./routes/referencesRoutes');
var endemic_atomized = require('./routes/endemicAtomized');

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






/*

var corsOption ={
  origin: '192.168.205.10:*'
} 
*/



app.use(cors());

//app.get('/fichas/:id_record/', record.getRecord);
app.get('/fichas/:id_record/', record.getRecordLast);
app.post('/fichas/', taxon_record_name.postRecord);
app.get('/lista/', record.getRecordList);
app.get('/record/:id_record/', record.getRecord);

app.post('/fichas/:id_record/more_information/', more_information.postVersion);
app.get('/fichas/:id_record/more_information/:version', more_information.getVersion);
app.post('/fichas/:id_record/associated_party/', associated_party.postVersion);
app.get('/fichas/:id_record/associated_party/:version', associated_party.getVersion);
app.post('/fichas/:id_record/direct_threats/', direct_threats.postVersion);
app.get('/fichas/:id_record/direct_threats/:version', direct_threats.getVersion);
app.post('/fichas/:id_record/taxon_record_name/', taxon_record_name.postVersion);
//app.post('/fichas/taxon_record_name/', taxon_record_name.postRecord);
app.get('/fichas/:id_record/taxon_record_name/:version', taxon_record_name.getVersion);
app.post('/fichas/:id_record/synonyms_atomized/', synonyms_atomized.postVersion);
app.get('/fichas/:id_record/synonyms_atomized/:version', synonyms_atomized.getVersion);
app.post('/fichas/:id_record/common_names_atomized/', common_names_atomized.postVersion);
app.get('/fichas/:id_record/common_names_atomized/:version', common_names_atomized.getVersion);
app.post('/fichas/:id_record/hierarchy/', hierarchy.postVersion);
app.get('/fichas/:id_record/hierarchy/:version', hierarchy.getVersion);
app.post('/fichas/:id_record/brief_description/', brief_description.postVersion);
app.get('/fichas/:id_record/brief_description/:version', brief_description.getVersion);
app.post('/fichas/:id_record/abstract/', abstract.postVersion);
app.get('/fichas/:id_record/abstract/:version', abstract.getVersion);
app.post('/fichas/:id_record/full_description/', full_description.postVersion);
app.get('/fichas/:id_record/full_description/:version', full_description.getVersion);
app.post('/fichas/:id_record/identification_keys/', identification_keys.postVersion);
app.get('/fichas/:id_record/identification_keys/:version', identification_keys.getVersion);
app.post('/fichas/:id_record/life_form/', life_form.postVersion);
app.get('/fichas/:id_record/life_form/:version', life_form.getVersion);
app.post('/fichas/:id_record/life_cycle/', life_cycle.postVersion);
app.get('/fichas/:id_record/life_cycle/:version', life_cycle.getVersion);
app.post('/fichas/:id_record/reproduction/', reproduction.postVersion);
app.get('/fichas/:id_record/reproduction/:version', reproduction.getVersion);
app.post('/fichas/:id_record/annual_cycles/', annual_cycles.postVersion);
app.get('/fichas/:id_record/annual_cycles/:version', annual_cycles.getVersion);
app.post('/fichas/:id_record/feeding/', feeding.postVersion);
app.get('/fichas/:id_record/feeding/:version', feeding.getVersion);
app.post('/fichas/:id_record/dispersal/', dispersal.postVersion);
app.get('/fichas/:id_record/dispersal/:version', dispersal.getVersion);
app.post('/fichas/:id_record/behavior/', behavior.postVersion);
app.get('/fichas/:id_record/behavior/:version', behavior.getVersion);
app.post('/fichas/:id_record/interactions/', interactions.postVersion);
app.get('/fichas/:id_record/interactions/:version', interactions.getVersion);
app.post('/fichas/:id_record/molecular_data/', molecular_data.postVersion);
app.get('/fichas/:id_record/molecular_data/:version', molecular_data.getVersion);
app.post('/fichas/:id_record/migratory/', migratory.postVersion);
app.get('/fichas/:id_record/migratory/:version', migratory.getVersion);
app.post('/fichas/:id_record/ecological_significance/', ecological_significance.postVersion);
app.get('/fichas/:id_record/ecological_significance/:version', ecological_significance.getVersion);
app.post('/fichas/:id_record/environmental_envelope/', environmental_envelope.postVersion);
app.get('/fichas/:id_record/environmental_envelope/:version', environmental_envelope.getVersion);
app.post('/fichas/:id_record/invasiveness/', invasiveness.postVersion);
app.get('/fichas/:id_record/invasiveness/:version', invasiveness.getVersion);
app.post('/fichas/:id_record/habitats/', habitats.postVersion);
app.get('/fichas/:id_record/habitats/:version', habitats.getVersion);
app.post('/fichas/:id_record/territory/', territory.postVersion);
app.get('/fichas/:id_record/territory/:version', territory.getVersion);
app.post('/fichas/:id_record/population_biology/', population_biology.postVersion);
app.get('/fichas/:id_record/population_biology/:version', population_biology.getVersion);
app.post('/fichas/:id_record/distribution/', distribution.postVersion);
app.get('/fichas/:id_record/distribution/:version', distribution.getVersion);
app.post('/fichas/:id_record/threat_status/', threat_status.postVersion);
app.get('/fichas/:id_record/threat_status/:version', threat_status.getVersion);
app.post('/fichas/:id_record/legislation/', legislation.postVersion);
app.get('/fichas/:id_record/legislation/:version', legislation.getVersion);
app.post('/fichas/:id_record/uses_management_and_conservation/', uses_management_and_conservation.postVersion);
app.get('/fichas/:id_record/uses_management_and_conservation/:version', uses_management_and_conservation.getVersion);
app.post('/fichas/:id_record/ancillary_data/', ancillary_data.postVersion);
app.get('/fichas/:id_record/ancillary_data/:version', ancillary_data.getVersion);
app.post('/fichas/:id_record/references/', references.postVersion);
app.get('/fichas/:id_record/references/:version', references.getVersion);
app.post('/fichas/:id_record/endemic_atomized/', endemic_atomized.postVersion);
app.get('/fichas/:id_record/endemic_atomized/:version', endemic_atomized.getVersion);

app.post('/fichas/:id_record/base_elements/', base_elements.postVersion);
app.get('/fichas/:id_record/base_elements/:version', base_elements.getVersion);


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
