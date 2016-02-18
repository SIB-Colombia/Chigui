var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var MolecularDataVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	molecularData : {type: Schema.Types.ObjectId, ref: 'MolecularData'}
},{ collection: 'MolecularDataVersion' });

var molecularDataAtomized = Element.extend({
	measurementOrFact : MeasurementOrFact,
	relatedTo : String
});

var MolecularData = Element.extend({
	molecularDataAtomized : [molecularDataAtomized],
	molecularDataUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'MolecularDataVersion' }
},{collection: 'MolecularData'});

module.exports = {
	             	MolecularDataVersion: mongoose.model('MolecularDataVersion', MolecularDataVersion ),
	             	MolecularData: mongoose.model('MolecularData', MolecularData )
	             };