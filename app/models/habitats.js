var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ad_objects = require('./additionalModels.js');
var Element = require('mongoose').model('Element').schema;
var ElementVersion = require('mongoose').model('ElementVersion').schema;
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var MeasurementOrFact = require('mongoose').model('MeasurementOrFact').schema;

var HabitatAtomized = Element.extend({
	measurementOrFact : MeasurementOrFact,
	relatedTo : String
});

var Habitats = Element.extend({
	habitatAtomized : [HabitatAtomized],
	habitatUnstructured : String
},{collection: 'habitats'});

var HabitatsVersion = ElementVersion.extend({
	habitats : Habitats
},{ collection: 'HabitatsVersion' });

module.exports = mongoose.model('HabitatsVersion', HabitatsVersion );