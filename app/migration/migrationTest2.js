var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var DirectThreatsVersion = require('../models/directThreats.js');
var add_objects = require('../models/additionalModels.js');
var taxon_record_name = require('../migration/taxonRecordNameMg.js');
var more_information = require('../migration/moreInformationMg.js');
var associated_party = require('../migration/associatedPartyMg.js');
var direct_threats = require('../migration/directThreatsMg.js');
var Schema = mongoose.Schema;



  var editorDb = mongoose.createConnection('mongodb://localhost:27017/editorDb', function(err) {
    if(err) {
      console.log('connection error', err);
    } else {
      console.log('connection successful');
      var recordSchema = new Schema({name:String}, { strict: false, versionKey: false });
      var RecordModel = editorDb.model('Record', recordSchema);

      async.waterfall([
        function(callback){ 
          RecordModel.find({}).exec(callback);
        },
        function(data,callback){ 
          var dataN = data;
          console.log(data.length);
          var catalogoDb=editorDb.useDb("catalogoDb");
          createRecord(catalogoDb, data);
          callback(null, dataN, catalogoDb);
        },
        function(data, catalogoDb,callback){ 
          var dataN = data;
          console.log("!!: "+data.length);
          saveDirectThreats(catalogoDb, data)
          callback(null,dataN);
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
  });


function createRecord(catalogoDb, data) {
  console.log();
  var newRecordSchema = add_objects.RecordVersion.schema;
  var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

  var texSchema = TaxonRecordNameVersion.schema;
  var TaxonRecordNameVersionModel = catalogoDb.model('TaxonRecordNameVersion', texSchema );
  var ob_ids= new Array();

  data.forEach(function(value, i) {
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
        }else{
          taxon_record_name_version.version=1;

          taxon_record_name_version.save(function(err){
            if(err){
              console.log("Error!!: "+err);
            }else{
              console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
            }
          });
        }  
        });
      }else{
        console.log({message: "Empty data in version of the element"});
      }
    }
  );
}

function saveDirectThreats(catalogoDb, data) {
  console.log();
  var newRecordSchema = add_objects.RecordVersion.schema;
  var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

  var directThreatsSchema = DirectThreatsVersion.schema;
  var DirectThreatsVersionModel = catalogoDb.model('DirectThreatsVersion', directThreatsSchema );

  var direct_threats_version = {}; 
  var ob_ids= new Array();
  data.forEach(function(value, i) {
    var direct_threats_version = {}; 
    direct_threats_version.directThreats = value._doc.directThreats;
    direct_threats_version._id = mongoose.Types.ObjectId();
    direct_threats_version.id_record=value._id;
    direct_threats_version.created=Date(); //***
    direct_threats_version = new DirectThreatsVersionModel(direct_threats_version);
    var id_v = direct_threats_version._id;
    var id_rc = direct_threats_version.id_record;
    ob_ids.push(id_v);
    if(typeof  direct_threats_version.directThreats!=="undefined" && direct_threats_version.directThreats!=""){
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
               console.log(err);
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
  });
}


