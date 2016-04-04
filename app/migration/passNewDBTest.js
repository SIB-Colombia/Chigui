var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var add_objects = require('../models/additionalModels.js');
var taxon_record_name = require('../migration/taxonRecordNameMg.js');
var more_information = require('../migration/moreInformationMg.js');
var associated_party = require('../migration/associatedPartyMg.js');
var direct_threats = require('../migration/directThreatsMg.js');
var Schema = mongoose.Schema;



function moveDocuments(){

  var options = {
    server: {  socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  }

  var conTemp = mongoose.createConnection('mongodb://localhost:27017/editorDb', function(err) {
      if(err) {
          console.log('connection error!', err);
      } else {
          console.log('connection successful Temp Database!');
          //callback(null, conTemp);
      }
  });

  /*
  var conNew = mongoose.createConnection('mongodb://localhost:27017/catalogoDB', function(err) {
      if(err) {
          console.log('connection error', err);
      } else {
          console.log('connection successful New Database');
      }
  });
  */

  async.waterfall([
    function(callback){ 
      var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });
      var RecordModel = conTemp.model('Record', recordSchema);
      RecordModel.find({}).exec(callback);
    },
    function(data,callback){ 
      console.log(data.length); 
      /*
      for(var i=0;i<data.length;i++){
        taxon_record_name.postRecord(data[i]._doc.taxonRecordName, data[i]._id);
      }
      */
      console.log(data[0]._id);
      taxon_record_name.postRecord(conTemp, data[0]._doc.taxonRecordName, data[0]._id);
      callback();
    },
    function(callback){ conTemp=mongoose.disconnect();},
    function(err, result) {
      if (err) {
        console.log("MM: "+err);
      }else{
        console.log('done!');
      }
    }
  ]);

}

moveDocuments();
//mongoose.connection.close();