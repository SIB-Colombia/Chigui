var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var DirectThreatsVersion = require('../models/directThreats.js');
var add_objects = require('../models/additionalModels.js');
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

  var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });
  var RecordModel = conTemp.model('Record', recordSchema);

  var texSchema = TaxonRecordNameVersion.schema;
  var conNew= conTemp.useDb('catalogoDB');

  var newRecordSchema = add_objects.RecordVersion.schema;
  var newRecordModel = conNew.model('RecordVersion', newRecordSchema );
  var TaxonRecordNameVersionModel = conNew.model('TaxonRecordNameVersion', texSchema );
  var directThreatsSchema = DirectThreatsVersion.schema;
  var DirectThreatsVersionModel = conNew.model('DirectThreatsVersion', directThreatsSchema );
  var direct_threats_version = {};


  async.waterfall([
    function(callback){ 
      RecordModel.find({}).exec(callback);
    },
    function(data,callback){ 
      console.log(data.length); 
      for(var i=0;i<data.length;i++){
        async.waterfall([
          function(callback){
            postRecord(newRecordModel, TaxonRecordNameVersionModel, data[i]);
            callback(null, 'TaxonRecordName');
          },
          function(callback){
            postDirectThreats(newRecordModel, DirectThreatsVersionModel, data[i]);
            callback(null, 'DirectThreats');
          }
          ]);
        
      }
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

function postRecord(newRecordModel, TaxonRecordNameVersionModel, record){
  var taxon_record_name_version = {};
  taxon_record_name_version.taxonRecordName = record._doc.taxonRecordName; 
  taxon_record_name_version._id = mongoose.Types.ObjectId();
  taxon_record_name_version.id_record=record._id;
  taxon_record_name_version.created=Date();
  taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);
  var id_v = taxon_record_name_version._id;
  var id_rc = taxon_record_name_version.id_record;
  var ver = 1;
  var ob_ids= new Array();
  ob_ids.push(id_v);
  console.log("!!!");
        newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
          //console.log(doc)
          if(err){
            console.log(err);
          }
          taxon_record_name_version.version=1;

          taxon_record_name_version.save(function(err){
          if(err){
            res.send(err);
          }
          console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
          });
        });
}

function postDirectThreats(newRecordModel, DirectThreatsVersionModel, record) {
  

  var direct_threats_version = {}; 
  direct_threats_version.directThreats = record._doc.directThreats;
  direct_threats_version._id = mongoose.Types.ObjectId();

  direct_threats_version.id_record=record._id;
  direct_threats_version.created=Date();
  var eleValue = direct_threats_version.directThreats;
  direct_threats_version = new DirectThreatsVersionModel(direct_threats_version);

  var id_v = direct_threats_version._id;
  var id_rc = direct_threats_version.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  
  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
    newRecordModel.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
       newRecordModel.findByIdAndUpdate( id_rc, { $push: { "directThreatsVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              console.log(err);
          }
          direct_threats_version.id_record=id_rc;
          direct_threats_version.version=doc.directThreatsVersion.length+1;
          var ver = direct_threats_version.version;
          direct_threats_version.save(function(err){
            if(err){
             res.send(err);
            }
            console.log({ message: 'Save DirectThreatsVersion', element: 'directThreats', version : ver, _id: id_v, id_record : id_rc });
         });
        });
      }
      }else{
        console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }
   });
   }else{
    console.log({message: "Empty data in version of the element"});
   } 
  }else{
    console.log({message: "The url doesn't have the id for the Record (Ficha)"});
  } 
  
};

moveDocuments();
//mongoose.connection.close();