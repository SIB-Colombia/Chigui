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

var Habitat = Element.extend({
	habitatAtomized : [HabitatAtomized],
	habitatUnstructured : String
},{collection: 'habitat'});

var HabitatVersion = ElementVersion.extend({
	habitat : Habitat
},{ collection: 'HabitatVersion' });

module.exports = {
	             	HabitatVersion: mongoose.model('HabitatVersion', HabitatVersion ),
	             	Habitat: mongoose.model('Habitat', Habitat )
	             };