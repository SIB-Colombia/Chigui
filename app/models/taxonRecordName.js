var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var rec_object = require('./recordVersion.js');
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

/*
var TaxonRecordName = new Schema({
	scientificName : scientificName,
	trn_ver : { type: Schema.Types.ObjectId, ref: 'TaxonRecordNameVersion' },
	ancillaryData : [{type: Schema.Types.ObjectId, ref: 'AncillaryDataTN'}]
});



var AncillaryDataTN = new Schema({
	dataType : String,
	mimeType : String,
	element : { type: Schema.Types.ObjectId, ref: 'TaxonRecordName' }
},{ collection: 'ancillaryData' });

*/








/*

var AncillaryDataSchema = new Schema({ 
	dataType : String,
	mimeType : String,
	agent : [{Agent:{
		firstName : String,
		lastName : String,
		organisation : String,
		position : String,
		address : [String],
		phone : [String],
		email : [String],
		role : String,
		homepage : [String]
	}}],
	modified : {type: Date, default: Date.now},
	title : String,
	license : String,
	rights : String,
	rightsHolder : String,
	bibliographicCitation : String,
	audience : [String],
	source : String,
	subject : [String],
	description : String,
	mediaURL : [String],
	thumbnailURL : String,
	location : String,
	geoPoint : String,
	additionalInformation : String,
	dataObject : String
});
*/

/*
var ReferenceSchema = new Schema ({
	profile_id : String,
	group_id : String,
	created : {type: Date, default: Date.now},
	last_modified : {type: Date, default: Date.now},
	identifiers : [String],
	abstractText : String,
	tags : String,
	type : String,
	source : String,
	title : String,
	authors : [String],
	year: {type: Date, default: Date.now},
	volume : String,
	issue : String,
	pages : String,
	series : String,
	chapter : String,
	websites : String,
	accesed : String,
	publisher : String,
	city : String,
	edition : String,
	institution : String,
	editors : [String],
	keywords : [String],
	doi : String,
	isbn : String,
	issn : String,
	link : String,
	taxonRecordId : String 
});
*/

module.exports = {
	             	TaxonRecordNameVersion: mongoose.model('TaxonRecordNameVersion', TaxonRecordNameVersion ),
	             	TaxonRecordName: mongoose.model('TaxonRecordName', TaxonRecordName )
	             };