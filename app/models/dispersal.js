var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var ElementVersion = require('mongoose').model('ElementVersion').schema;
var AncillaryData = require('mongoose').model('AncillaryData').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var DispersalAtomized = new Schema ({
	purpose : String,
	type : String,
	structureDispersed : String,
	distance : String,
	ancillaryData : AncillaryData
},{ strict: false, versionKey: false });

var Dispersal = Element.extend({
	dispersalAtomized : DispersalAtomized,
	dispersalUnstructured : String
},{ strict: false, versionKey: false });

var DispersalVersion = ElementVersion.extend({
	dispersal : Dispersal
},{ collection: 'DispersalVersion', versionKey: false });

module.exports = mongoose.model('DispersalVersion', DispersalVersion );