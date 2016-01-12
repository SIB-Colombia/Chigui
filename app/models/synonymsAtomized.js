var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;

var SynonymsAtomizedVersion = new Schema({
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	synonymsAtomized : {type: Schema.Types.ObjectId, ref: 'SynonymsAtomized'}
},{ collection: 'SynonymsAtomizedVersion' });

var scientificName = new Schema({
	attributes : { id : Number, isAnamorphic: Boolean, nomenclaturalCode: String }
});


var SynonymsAtomized = Element.extend({
	scientificName : scientificName,
	synonymStatus : String,
	sa_ver : { type: Schema.Types.ObjectId, ref: 'SynonymsAtomizedVersion' }
},{ collection: 'SynonymsAtomized' });




module.exports = {
	             	SynonymsAtomizedVersion: mongoose.model('SynonymsAtomizedVersion', SynonymsAtomizedVersion ),
	             	SynonymsAtomized: mongoose.model('SynonymsAtomized', SynonymsAtomized )
	             };

