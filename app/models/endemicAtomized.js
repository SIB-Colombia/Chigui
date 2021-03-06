var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var ElementVersion = require('mongoose').model('ElementVersion').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var EndemicAtomized = Element.extend({
	endemicTo: [String],
	endemicIn : String,
},{ collection: 'endemicAtomized', versionKey: false });

var EndemicAtomizedVersion = ElementVersion.extend({
	endemicAtomized : [EndemicAtomized]
},{ collection: 'EndemicAtomizedVersion', versionKey: false });

module.exports = mongoose.model('EndemicAtomizedVersion', EndemicAtomizedVersion );