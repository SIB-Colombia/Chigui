var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var ElementVersion = require('mongoose').model('ElementVersion').schema;


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
	distributionUnstructured : String
},{collection: 'distribution'});

var DistributionVersion = ElementVersion.extend({
	distribution : [Distribution]
},{ collection: 'DistributionVersion' });

module.exports = mongoose.model('DistributionVersion', DistributionVersion );