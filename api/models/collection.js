var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');

var RecordCollection = new Schema ({
	id_user : String,
	records : [{ type: Schema.Types.ObjectId, ref: 'RecordVersion' }],
	created : { type: Date, default: Date.now },
	updated : { type: Date },
	description : String,
	tags : [String],
	groups : [{ type: Schema.Types.ObjectId, ref: 'Groups' }]
},{ collection: 'RecordCollections' });

module.exports = mongoose.model('RecordCollection', RecordCollection );