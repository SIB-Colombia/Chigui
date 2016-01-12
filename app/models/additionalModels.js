var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;


var Element = new Schema ({
	ancillaryData : [{type: Schema.Types.ObjectId, ref: 'AncillaryData'}]
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
	taxonRecordId : String
});


var AncillaryData = new Schema({
	dataType : String,
	mimeType : String,
	element : { type: Schema.Types.ObjectId, ref: 'Element' },
	reference : [Reference]
},{ collection: 'ancillaryData' });


//module.exports = mongoose.model('Element', Element);


module.exports = {
	             	Element : mongoose.model('Element', Element),
	             	AncillaryData: mongoose.model('AncillaryData', AncillaryData )
	             };
	             