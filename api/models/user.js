var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Agent = require('mongoose').model('Agent').schema;

var User = new Agent.extend ({
	groups : [{ type: Schema.Types.ObjectId, ref: 'Groups' }]
},{ collection: 'Users' });