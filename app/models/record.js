var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
//var searchable = require('mongoose-searchable');
//var textSearch = require('mongoose-text-search');
var Schema = mongoose.Schema;

var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });

/*
BaseElements
Language
Version
Revision
taxonRecordName
*/

module.exports = mongoose.model('Record', recordSchema);