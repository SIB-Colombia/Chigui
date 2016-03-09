var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var ElementVersion = require('mongoose').model('ElementVersion').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var Territory = Element.extend({
	territoryAtomized: {
		extentOfOcurrence : String,
		areaOfOccupancy : String
	},
	territoryUnstructured : String
},{collection: 'territory'});

var TerritoryVersion = ElementVersion.extend({
	territory : Territory
},{ collection: 'TerritoryVersion' });

module.exports = mongoose.model('TerritoryVersion', TerritoryVersion );