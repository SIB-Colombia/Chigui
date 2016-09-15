var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Agent = require('mongoose').model('Agent').schema;

var User = new Schema ({
	id_user: String,
	groups : [{ type: Schema.Types.ObjectId, ref: 'Groups' }]
},{ collection: 'Users' });

module.exports = mongoose.model('User', User );