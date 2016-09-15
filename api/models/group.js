var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');

var Group = new Schema ({
	users : [String],
	admins : [{type: String, validate: [arrayLimit, '{PATH} exceeds the limit of 10'] }], //***************
	image : String,
	created : { type: Date, default: Date.now },
	description : String,
	tags : [String],
	listRecords : [{ type: Schema.Types.ObjectId, ref: 'ListRecords' }]
},{ collection: 'Groups' });

function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model('Group', Group );