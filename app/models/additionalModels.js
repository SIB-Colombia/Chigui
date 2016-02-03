var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

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
	year : {type: Date, default: Date.now},
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
	RecordId : String
},{ collection: 'Reference' });

var Agent = new Schema({
	firstName: String,
	lastName: String,
	organisation: String,
	position: String,
	address: String,
	phone: String,
	email: String,
	role: String,
	homepage: String
});

var AncillaryData = new Schema({
	//identifier : String,
	dataType : String,
	mimeType : String,
	agent: [Agent],
	created : {type: Date, default: Date.now},
	modified : {type: Date, default: Date.now},
	license : String,
	rights  : String,
	rigthsHolder : String,
	bibliographicCitation : String,
	audience: [String],
	source : String,
	subject : [String],
	description : String,
	mediaURL : [String],
	thumbnailURL : String,
	location : String,
	geoPoint : String,
	additionalInformation : String,
	dataObject: String,
	element : { type: Schema.Types.ObjectId, ref: 'Element' },
	reference : [{ type: Schema.Types.ObjectId, ref: 'Reference' }]
},{ collection: 'ancillaryData' });



var Element = new Schema ({
	ancillaryData : [{type: Schema.Types.ObjectId, ref: 'AncillaryData'}]
});

var RecordVersion = new Schema({
	name : String,
	taxonRecordNameVersion : [{ type: Schema.Types.ObjectId, ref: 'TaxonRecordNameVersion' }],
	synonymsAtomizedVersion : [{ type: Schema.Types.ObjectId, ref: 'SynonymsAtomizedVersion' }]
}, { strict: false, collection: 'RecordVersion' });










//module.exports = mongoose.model('Element', Element);


module.exports = {
	             	Element : mongoose.model('Element', Element),
	             	AncillaryData: mongoose.model('AncillaryData', AncillaryData ),
	             	RecordVersion : mongoose.model('RecordVersion', RecordVersion ),
	             	Reference : mongoose.model('Reference', Reference )
	             };
	             