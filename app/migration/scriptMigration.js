var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var DirectThreatsVersion = require('../models/directThreats.js');
var AssociatedPartyVersion = require('../models/associatedParty.js');
var add_objects = require('../models/additionalModels.js');
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
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var texSchema = TaxonRecordNameVersion.schema;
          var TaxonRecordNameVersionModel = catalogoDb.model('TaxonRecordNameVersion', texSchema );
          var ob_ids= new Array();

          async.eachSeries(data, function(record, callback) {
            console.log("ID record: "+record._id);
            var taxon_record_name_version = {};
            taxon_record_name_version.taxonRecordName = record._doc.taxonRecordName;
            taxon_record_name_version._id = mongoose.Types.ObjectId();
            taxon_record_name_version.id_record=record._id;
            taxon_record_name_version.created=Date(); //***
            taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);
            var id_v = taxon_record_name_version._id;
            var id_rc = taxon_record_name_version.id_record;
            var ver = 1; //**
            ob_ids.push(id_v);
            if(typeof  taxon_record_name_version.taxonRecordName!=="undefined" && taxon_record_name_version.taxonRecordName!=""){
              newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
              if(err){
                console.log("Saving taxonRecordName Error!: "+err);
              }else{
                taxon_record_name_version.version=1;
                taxon_record_name_version.save(function(err){
                  if(err){
                    console.log("Saving taxonRecordName Error!: "+err);
                  }else{
                    console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    callback();
                  }
                });
              }  
              });
            }else{
              console.log({message: "Empty data in version of the element taxonRecordName"});
              callback();
            }
          }, function(err){
              // if any of the file processing produced an error, err would equal that error
              if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
              } else {
                console.log('All files have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var directThreatsSchema = DirectThreatsVersion.schema;
          var DirectThreatsVersionModel = catalogoDb.model('DirectThreatsVersion', directThreatsSchema );

          var direct_threats_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var direct_threats_version = {}; 
            direct_threats_version.directThreats = record._doc.directThreats;
            direct_threats_version._id = mongoose.Types.ObjectId();
            direct_threats_version.id_record=record._id;
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
                        console.log("Saving directThreats Error!: "+err);
                      }else{
                        direct_threats_version.id_record=id_rc;
                        direct_threats_version.version=doc.directThreatsVersion.length+1;
                        var ver = direct_threats_version.version;
                        direct_threats_version.save(function(err){
                          if(err){
                            console.log("Saving directThreats Error!: "+err);
                          }else{
                            console.log({ message: 'Save DirectThreatsVersion', element: 'directThreats', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element directThreats"});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process element directThreats: '+err);
              } else {
                console.log('All files have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var moreInformationSchema = MoreInformationVersion.schema;
          var MoreInformationVersionModel = catalogoDb.model('MoreInformationVersion', moreInformationSchema );
          var more_information_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var more_information_version = {}; 
            more_information_version.moreInformation = record._doc.moreInformation;
            more_information_version._id = mongoose.Types.ObjectId();
            more_information_version.id_record=record._id;
            more_information_version.created=Date(); //***
            more_information_version = new MoreInformationVersionModel(more_information_version);
            var id_v = more_information_version._id;
            var id_rc = more_information_version.id_record;
            ob_ids.push(id_v);
            if(typeof  more_information_version.moreInformation!=="undefined" && more_information_version.moreInformation!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "moreInformationVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving moreInformation Error!: "+err);
                      }else{
                        more_information_version.id_record=id_rc;
                        more_information_version.version=doc.moreInformationVersion.length+1;
                        var ver = more_information_version.version;
                        more_information_version.save(function(err){
                          if(err){
                            console.log("Saving moreInformation Error!: "+err);
                          }else{
                            console.log({ message: 'Save MoreInformationVersion', element: 'moreInformation', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element moreInformation"});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving moreInformation have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var associatedPartySchema = AssociatedPartyVersion.schema;
          var AssociatedPartyVersionModel = catalogoDb.model('AssociatedPartyVersion', associatedPartySchema );
          var associated_party_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var associated_party_version = {}; 
            associated_party_version.associatedParty = record._doc.associatedParty;
            associated_party_version._id = mongoose.Types.ObjectId();
            associated_party_version.id_record=record._id;
            associated_party_version.created=record._id.getTimestamp(); //***
            associated_party_version = new AssociatedPartyVersionModel(associated_party_version);
            var id_v = associated_party_version._id;
            var id_rc = associated_party_version.id_record;
            ob_ids.push(id_v);
            if(typeof  associated_party_version.associatedParty!=="undefined" && associated_party_version.associatedParty!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "associatedPartyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving associatedParty Error!: "+err);
                      }else{
                        associated_party_version.id_record=id_rc;
                        associated_party_version.version=doc.associatedPartyVersion.length+1;
                        var ver = associated_party_version.version;
                        associated_party_version.save(function(err){
                          if(err){
                            console.log("Saving associatedParty Error!: "+err);
                          }else{
                            console.log({ message: 'Save AssociatedPartyVersion', element: 'associatedParty', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element associatedParty"});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving associatedParty have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          editorDb=mongoose.disconnect();
        },
        function(callback){ 
          editorDb=mongoose.disconnect();
        },
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





