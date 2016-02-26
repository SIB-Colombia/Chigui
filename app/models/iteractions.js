var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var InteractionsVersion = new Schema({
	record : { type: Schema.Types.ObjectId, ref: 'RecordVersion' },
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	iteractions : {type: Schema.Types.ObjectId, ref: 'Interactions'}
},{ collection: 'InteractionsVersion' });

var InteractionsSpeciesType = Element.extend({
	measurementOrFact : MeasurementOrFact
});

var interactionsAtomized = Element.extend({
	interactionSpecies: String,
	interactionSpeciesType: [InteractionsSpeciesType]
});

var Interactions = Element.extend({
	interactionsAtomized : [interactionsAtomized],
	interactionUnstructured : String,
	id_version : { type: Schema.Types.ObjectId, ref: 'InteractionsVersion' }
},{collection: 'Interactions'});

module.exports = {
	             	InteractionsVersion: mongoose.model('InteractionsVersion', InteractionsVersion ),
	             	Interactions: mongoose.model('Interactions', Interactions )
	             };