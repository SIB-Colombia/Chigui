var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var add_objects = require('../models/additionalModels.js');
var taxon_record_name = require('../migration/taxonRecordNameMg.js');
var more_information = require('../migration/moreInformationMg.js');
var associated_party = require('../migration/associatedPartyMg.js');
var direct_threats = require('../migration/directThreatsMg.js');
var Schema = mongoose.Schema;



function moveDocuments(){

  var conTemp = mongoose.createConnection('mongodb://localhost:27017/editorDb', function(err) {
    	if(err) {
        	console.log('connection error', err);
    	} else {
        	console.log('connection successful Temp Database');
    	}
	});

	var conNew = mongoose.createConnection('mongodb://localhost:27017/catalogoDB', function(err) {
    	if(err) {
        	console.log('connection error', err);
    	} else {
        	console.log('connection successful New Database');
    	}
	});

	var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });

	var RecordModel = conTemp.model('Record', recordSchema);

	 var newRecordSchema = add_objects.RecordVersion.schema;
  	var texSchema = TaxonRecordNameVersion.schema;
  	var moreInformationSchema = MoreInformationVersion.schema;

  	var newRecordModel = conNew.model('RecordVersion', newRecordSchema );
  	var texModel = conNew.model('TaxonRecordNameVersion', texSchema );
  	var moreInformationModel = conNew.model('MoreInformationVersion', moreInformationSchema );

  	RecordModel.find({}, function (err, data){
  		if(err){
  			console.log(err);
  		}else{
  			for(var i=0;i<data.length;i++){
          /*
          console.log(data[i]._id);
          console.log(data[i]._doc.taxonRecordName);
          console.log(Object.keys(data[i]));
          */
          
  				var id_record = data[i]._id;
          //connection, RecordModel, element, id_record
          taxon_record_name.postRecord(conNew, newRecordModel, data[i]._doc.taxonRecordName, id_record);
          more_information.postVersion(conNew, newRecordModel, data[i]._doc.moreInformation, id_record);
          associated_party.postVersion(conNew, newRecordModel, data[i]._doc.associatedParty, id_record);
  			}
  		}
  	});

  	
  	return;

}

moveDocuments();
//mongoose.connection.close();