var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var AncillaryData = require('mongoose').model('AncillaryData').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var FeedingAtomized = new Schema ({
	type : String,
	thropic : [{ strategy : String }],
	ancillaryData : AncillaryData
},{ strict: false, versionKey: false });

var Feeding = Element.extend({
	feedingAtomized : FeedingAtomized,
	feedingUnstructured : String
},{ strict: false, versionKey: false });

var FeedingVersion = new ElementVersion.extend({
	feeding : Feeding
},{ collection: 'FeedingVersion', versionKey: false });

module.exports = mongoose.model('FeedingVersion', FeedingVersion );