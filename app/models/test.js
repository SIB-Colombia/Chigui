var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var ElementVersionSchema = new mongoose.Schema({
	created : {type: Date, default: Date.now},
	id_user : String,
	version : { type: Number, min: 0 },
	element: [{type: mongoose.Schema.Types.ObjectId, ref: 'Element'}]
});

var ElementSchema = new mongoose.Schema({
	name : String
});