var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;


var BaseElementsVersion = new Schema({
	id_record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	baseElements : {type: Schema.Types.ObjectId, ref: 'BaseElements'}
},{ collection: 'BaseElementsVersion' });

var BaseElements = Element.extend({
	taxonRecordID: String,
	taxonConceptID: String,
	globalUniqueIdentifier: String,
	abstractBaseElement: String,
	id_version : { type: Schema.Types.ObjectId, ref: 'BaseElementsVersion' }
},{ collection: 'BaseElements' });



module.exports = {
	             	BaseElementsVersion: mongoose.model('BaseElementsVersion', BaseElementsVersion ),
	             	BaseElements: mongoose.model('BaseElements', BaseElements )
	             };