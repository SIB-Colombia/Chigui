var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');

var Group = new Schema ({
	users : [String],
	admin : [String],
	image : String,
	created : { type: Date, default: Date.now },
	description : String,
	tags : [String],
	collections : [{ type: Schema.Types.ObjectId, ref: 'Collections' }]
},{ collection: 'Groups' });