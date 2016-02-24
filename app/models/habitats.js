var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var HabitatVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	habitat : {type: Schema.Types.ObjectId, ref: 'Habitat'}
},{ collection: 'IteractionsVersion' });

var HabitatAtomized = Element.extend({
	measurementOrFact : MeasurementOrFact,
	relatedTo : String
});

var Habitat = Element.extend({
	habitatAtomized : [HabitatAtomized],
	habitatUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'HabitatVersion' }
},{collection: 'Habitat'});

module.exports = {
	             	HabitatVersion: mongoose.model('HabitatVersion', HabitatVersion ),
	             	Habitat: mongoose.model('Habitat', Habitat )
	             };