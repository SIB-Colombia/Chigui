var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var EcologicalSignificanceVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	ecologicalSignificance : {type: Schema.Types.ObjectId, ref: 'EcologicalSignificance'}
},{ collection: 'EcologicalSignificanceVersion' });

var ecologicalSignificanceAtomized = Element.extend({
	measurementOrFact : MeasurementOrFact
});

var EcologicalSignificance = Element.extend({
	ecologicalSignificanceAtomized : [ecologicalSignificanceAtomized],
	ecologicalSignificanceUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'EcologicalSignificanceVersion' }
},{collection: 'EcologicalSignificance'});

module.exports = {
	             	EcologicalSignificanceVersion: mongoose.model('EcologicalSignificanceVersion', EcologicalSignificanceVersion ),
	             	EcologicalSignificance: mongoose.model('EcologicalSignificance', EcologicalSignificance )
	             };