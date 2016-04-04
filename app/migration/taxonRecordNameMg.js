var mongoose = require('mongoose');

var add_objects = require('../models/additionalModels.js');
var async = require('async');


var exports = module.exports = {};

exports.postRecord = function(conTemp, element, id_record) {
 

/*
  console.log(Object.keys(RecordModel));
  console.log(RecordModel.db);
  
  console.log(id_record);
  console.log(id_rc);
  console.log(ob_ids);
  */

  //console.log(Object.keys(RecordModel));

  conNew = conTemp.useDb('catalogoDB');

  async.waterfall([
    function(callback){

      var newRecordSchema = add_objects.RecordVersion.schema;
      var newRecordModel = conNew.model('RecordVersion', newRecordSchema );
  
      var texSchema = TaxonRecordNameVersion.schema;
      var TaxonRecordNameVersionModel = conNew.model('TaxonRecordNameVersion', texSchema );

      var taxon_record_name_version = {}; 
      taxon_record_name_version.taxonRecordName = element; 
      taxon_record_name_version._id = mongoose.Types.ObjectId();

      taxon_record_name_version.id_record=id_record;
      taxon_record_name_version.created=Date();
      var eleValue = taxon_record_name_version.taxonRecordName;
      taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);

      var id_v = taxon_record_name_version._id;
      var id_rc = id_record;
      var ver = 1;
      var ob_ids= new Array();
      ob_ids.push(id_v);
      callback(null, eleValue, newRecordModel, taxon_record_name_version, id_v, id_rc, ver, ob_ids);
    },
    function(eleValue, newRecordModel, taxon_record_name_version, id_v, id_rc, ver, ob_ids,callback){ 
      if(typeof  eleValue!=="undefined" && eleValue!=""){
      
      newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
        //console.log("WTF!!");
        //console.log("doc!!"+doc);
        if(err){
          console.log("Error!:"+err);
          return;
        }else{
          console.log("!!!!");
          taxon_record_name_version.version=1;
          callback(null, eleValue, newRecordModel, taxon_record_name_version, id_v, id_rc, ver, ob_ids);
          
        }
      });
      }else{
        console.log({message: "Empty data in version of the element"});
      }
    },
    function(eleValue, newRecordModel, taxon_record_name_version, id_v, id_rc, ver, ob_ids,callback){ 
      taxon_record_name_version.save(function(err){
            if(err){
              res.send(err);
            }else{
              console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
              
            }
          });
    }
    ]);

  
}

