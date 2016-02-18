var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var IteractionsVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	iteractions : {type: Schema.Types.ObjectId, ref: 'Iteractions'}
},{ collection: 'IteractionsVersion' });

var IteractionsSpeciesType = Element.extend({
	measurementOrFact : MeasurementOrFact
});

var interactionsAtomized = Element.extend({
	interactionSpecies: String,
	interactionSpeciesType: [IteractionsSpeciesType]
});

var Iteractions = Element.extend({
	interactionsAtomized : interactionsAtomized,
	interactionUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'IteractionsVersion' }
},{collection: 'Iteractions'});

module.exports = {
	             	IteractionsVersion: mongoose.model('IteractionsVersion', IteractionsVersion ),
	             	Iteractions: mongoose.model('Iteractions', Iteractions )
	             };