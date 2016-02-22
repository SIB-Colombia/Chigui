var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var FullDescription = Element.extend({
	fullDescriptionUnstructured: String
},{ collection: 'FullDescription', strict: false, versionKey: false });

var FullDescriptionVersion = new ElementVersion.extend({
	fullDescription : FullDescription
},{ collection: 'FullDescriptionVersion' });

module.exports = mongoose.model('FullDescriptionVersion', FullDescriptionVersion );