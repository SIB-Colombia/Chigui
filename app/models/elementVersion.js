var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;


var TaxonRecordNameVersionSchema = new Schema({
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	taxonRecordName : {type: Schema.Types.ObjectId, ref: 'TaxonRecordNameSchema'}
});

var TaxonRecordNameSchema = new Schema({
	trn_version : { type: Schema.Types.ObjectId, ref: 'TaxonRecordNameVersion' },
	//scientificName : {type: Schema.Types.ObjectId, ref: 'ScientificName'}
	name : String
});


/*
var TaxonRecordNameSchema = new Schema({
	//trn_version : { type: Number, ref: 'TaxonRecordNameVersion' },
	//scientificName : {type: Schema.Types.ObjectId, ref: 'ScientificName'}
	name : String
});

var TaxonRecordNameVersionSchema = new Schema({
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	taxonRecordName : TaxonRecordNameSchema
});
*/





module.exports = mongoose.model('TaxonRecordNameVersionSchema', TaxonRecordNameVersionSchema );