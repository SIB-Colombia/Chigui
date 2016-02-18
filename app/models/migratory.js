var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var MigratoryVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	migratory : {type: Schema.Types.ObjectId, ref: 'Migratory'}
},{ collection: 'MigratoryVersion' });

var migratoryAtomized = Element.extend({
	causes : String,
	patterns : String,
	routes : String,
	season : String
});

var Migratory = Element.extend({
	migratoryAtomized : [migratoryAtomized],
	migratoryUnstructured : String,
	additionalInformation : String,
	dataObject : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'MigratoryVersion' }
},{collection: 'Migratory'});

module.exports = {
	             	MigratoryVersion: mongoose.model('MigratoryVersion', MigratoryVersion ),
	             	Migratory: mongoose.model('Migratory', Migratory )
	             };