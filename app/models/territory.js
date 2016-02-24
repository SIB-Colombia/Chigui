var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var TerritoryVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	territory : {type: Schema.Types.ObjectId, ref: 'Territory'}
},{ collection: 'TerritoryVersion' });

var Territory = Element.extend({
	territoryAtomized: {
		extentOfOcurrence : String,
		areaOfOccupancy : String
	},
	territoryUnstructured : String
},{collection: 'Territory'});

module.exports = {
	             	TerritoryVersion: mongoose.model('TerritoryVersion', TerritoryVersion ),
	             	Territory: mongoose.model('Territory', Territory )
	             };