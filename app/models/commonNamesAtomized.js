var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;

var CommonNamesAtomizedVersion = new Schema({
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	commonNamesAtomized : {type: Schema.Types.ObjectId, ref: 'CommonNamesAtomized'}
},{ collection: 'CommonNamesAtomizedVersion' });


var CommonNamesAtomized = Element.extend({
	scientificName : scientificName,
	synonymStatus : String,
	coa_ver : { type: Schema.Types.ObjectId, ref: 'CommonNamesAtomizedVersion' }
},{ collection: 'SynonymsAtomized' });