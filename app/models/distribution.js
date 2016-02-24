var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var DistributionVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	distribution : {type: Schema.Types.ObjectId, ref: 'Distribution'}
},{ collection: 'DistributionVersion' });

var DistributionScope = Element.extend({
	type : String,
});

distributionAtomized = Element.extend({
	country : String,
	county : String,
	municipality: String,
	locality : String,
	stateProvince: String
});

var Distribution = Element.extend({
	distributionScope: DistributionScope,
	temporalCoverage:{
		startDate : {type: Date, default: Date.now()},
		endDate: {type: Date, default: Date.now()}
	},
	distributionAtomized : [distributionAtomized],
	distributionUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'DistributionVersion' }
},{collection: 'Distribution'});

module.exports = {
	             	DistributionVersion: mongoose.model('DistributionVersion', DistributionVersion ),
	             	Distribution: mongoose.model('Distribution', Distribution )
	             };