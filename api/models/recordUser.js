var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Agent = require('mongoose').model('Agent').schema;

var RecordUser = new Schema ({
	records : [{ type: Schema.Types.ObjectId, ref: 'Record' }]
	users : [{ type: Schema.Types.ObjectId, ref: 'User' }]
},{ collection: 'RecordUser' });

module.exports = mongoose.model('RecordUser', RecordUser );