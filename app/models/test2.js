var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

/*
var Element = new Schema({
	ancillaryData : [{ type: Schema.Types.ObjectId, ref: 'AncillaryData' }]
});
*/


var TaxonRecordNameVersionSchema = new Schema({
	_id : Number,
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 }
	//taxonRecordName : {type: Schema.Types.ObjectId, ref: 'TaxonRecordName'}
});

/*
var TaxonRecordName = new Schema({
	trn_version : { type: Number, ref: 'TaxonRecordNameVersion' },
	//scientificName : {type: Schema.Types.ObjectId, ref: 'ScientificName'}
	name : String
});
*/

module.exports = mongoose.model('TRNV', TaxonRecordNameVersionSchema );

/*


var ScientificName = Element.extend({
	simple : String,
	rank : String,
	year : {type: Date, default: Date.now},
	isAnamorphic : Boolean,
	canonicalName : {CanonicalName:{
		simple: String,
		uninomial: String,
		genus : {Reference:{ref : String, linkType : String}},
		epithet : {Epithet : {infragenericEpithet : String, specificEpithet: String, infraspecificEpithet: String}},
	}},
	canonicalAuthorship : {simple : String, authorship : {NameCitation: {simple : String, year : {type: Date, default: Date.now}, authors:[String]}}}, //**
	publishedIn : {Reference : {identifier: String, datatype : String, source : String, simple : String}},
	microReference : String,
	Typification : String,
	spellingCorrentionOf :[{NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }}],
	basionym : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	basedOn : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	conservedAgainst : [{NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }}],
	laterHomonymOf : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	sanctioned : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	replacementNameFor : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	publicationStatus : {NomenclaturalNote: {ruleConsidered: String, Note : String, relatedName : String, publishedIn : String, microReference }},
	providerLink : String
	//providerSpecificData : {Placeholder: {anyOne:[String], anyTwo: String}}
});

var AncillaryData = new Schema({
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

var Reference = new Schema ({
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