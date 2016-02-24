var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;

var EndemicAtomizedVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	endemicAtomized : {type: Schema.Types.ObjectId, ref: 'EndemicAtomized'}
},{ collection: 'EndemicAtomizedVersion' });

var EndemicAtomized = Element.extend({
	endemicTo: [String],
	endemicIn : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'EndemicAtomizedVersion' }
},{collection: 'EndemicAtomized'});

module.exports = {
	             	EndemicAtomizedVersion: mongoose.model('EndemicAtomizedVersion', EndemicAtomizedVersion ),
	             	EndemicAtomized: mongoose.model('EndemicAtomized', EndemicAtomized )
	             };