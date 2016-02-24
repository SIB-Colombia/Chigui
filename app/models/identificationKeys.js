var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var IdentificationKeys = Element.extend({
	keys : [String]
},{ collection: 'IdentificationKeys', strict: false, versionKey: false });

var IdentificationKeysVersion = new ElementVersion.extend({
	identificationKeys : IdentificationKeys
},{ collection: 'IdentificationKeysVersion', versionKey: false });

module.exports = mongoose.model('IdentificationKeysVersion', IdentificationKeysVersion );