var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
//var searchable = require('mongoose-searchable');
//var textSearch = require('mongoose-text-search');
var Schema = mongoose.Schema;

var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });

//recordSchema.index({ associatedParty: "text"});
//recordSchema.plugin(searchable,{fields:['taxonRecordName']});
//recordSchema.plugin(textSearch);

recordSchema.index({"taxonRecordName.scientificName.simple":"text"});

recordSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Record', recordSchema);