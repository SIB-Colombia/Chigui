var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;



var TaxonRecordNameVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	taxonRecordName : {type: Schema.Types.ObjectId, ref: 'TaxonRecordName'}
});

var scientificName = new Schema({
	attributes : { id : Number, isAnamorphic: Boolean, nomenclaturalCode: String }
});

var TaxonRecordName = Element.extend({
	scientificName : scientificName,
	trn_ver : { type: Schema.Types.ObjectId, ref: 'TaxonRecordNameVersion' }
});



module.exports = {
	             	TaxonRecordNameVersion: mongoose.model('TaxonRecordNameVersion', TaxonRecordNameVersion ),
	             	TaxonRecordName: mongoose.model('TaxonRecordName', TaxonRecordName )
	             };