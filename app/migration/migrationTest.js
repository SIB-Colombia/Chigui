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

  var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });
  var RecordModel = conTemp.model('Record', recordSchema);

  async.waterfall([
    function(callback){ 
      RecordModel.find({}).exec(callback);
    },
    function(data,callback){ 
      //taxon_record_name.postRecord(conTemp, data[0]._doc.taxonRecordName, data[0]._id);
      dataN=data;
      createRecord(data);
      callback(dataN);
    },
    function(data,callback){ 
      console.log(data[0]._id);
      console.log(data.length);
    },
    function(callback){ /*conTemp=mongoose.disconnect();*/},
    function(err, result) {
      if (err) {
        console.log("Error: "+err);
      }else{
        console.log('done!');
      }
    }
  ]);

}

function createRecord(data) {
  var conNew = mongoose.createConnection('mongodb://localhost:27017/catalogoDB', function(err) {
      if(err) {
          console.log('connection error', err);
      } else {
          console.log('connection successful New Database');
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = conNew.model('RecordVersion', newRecordSchema );

          var texSchema = TaxonRecordNameVersion.schema;
          var TaxonRecordNameVersionModel = conNew.model('TaxonRecordNameVersion', texSchema );
  
          var ob_ids= new Array();
          data.forEach(function(value, i) {
            //console.log(value);
            //console.log(i);
          var taxon_record_name_version = {};
          taxon_record_name_version.taxonRecordName = value._doc.taxonRecordName;
          taxon_record_name_version._id = mongoose.Types.ObjectId();
          taxon_record_name_version.id_record=value._id;
          taxon_record_name_version.created=Date(); //***
          taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);
          var id_v = taxon_record_name_version._id;
          var id_rc = taxon_record_name_version.id_record;
          var ver = 1; //**
          ob_ids.push(id_v);
          if(typeof  taxon_record_name_version.taxonRecordName!=="undefined" && taxon_record_name_version.taxonRecordName!=""){

            newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
          if(err){
            console.log("Error!: "+err);
          }
          taxon_record_name_version.version=1;

          taxon_record_name_version.save(function(err){
          if(err){
            console.log("Error!!: "+err);
          }
            console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });

          });
        });
      }else{
        console.log({message: "Empty data in version of the element"});
      }
    }
    );
    }
  });
}





moveDocuments();
//mongoose.connection.close();