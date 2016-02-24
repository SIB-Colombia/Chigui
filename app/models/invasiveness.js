var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var InvasivenessVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	invasiveness : {type: Schema.Types.ObjectId, ref: 'Invasiveness'}
},{ collection: 'InvasivenessVersion' });

var invasivenessAtomized = Element.extend({
	origin : String,
	presence : String,
	persistence : String,
	distribution : [String],
	harmful : String,
	modified : {type : Date, default : Date.now},
	startValidateDate : {type : Date, default : Date.now},
	endValidateDate : {type : Date, default : Date.now},
	countryCode : String,
	stateProvince : String,
	county : String,
	localityName : String,
	language : String,
	citation : String,
	abundance : String,
	trend : String,
	rateOfSpread : String,
	regulatoryListing : String,
	memo : String,
	localityType : String,
	locationValue : String,
	publicationDatePrecision : String,
	whatImpact : String,
	vector : String,
	route : String,
	target : String,
	mechanism : String
});

var Invasiveness = Element.extend({
	invasivenessAtomized : [invasivenessAtomized],
	invasivenessUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'InvasivenessVersion' }
},{collection: 'Invasiveness'});

module.exports = {
	             	InvasivenessVersion: mongoose.model('InvasivenessVersion', InvasivenessVersion ),
	             	Invasiveness: mongoose.model('Invasiveness', Invasiveness )
	             };