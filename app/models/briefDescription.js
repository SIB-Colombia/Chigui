var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;


var briefDescriptionVersion = new ElementVersion.extend({
	briefDescription : String
},{ collection: 'briefDescriptionVersion' });

module.exports = mongoose.model('briefDescriptionVersion', briefDescriptionVersion );