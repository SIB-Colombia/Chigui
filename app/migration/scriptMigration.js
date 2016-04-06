var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var DirectThreatsVersion = require('../models/directThreats.js');
var AssociatedPartyVersion = require('../models/associatedParty.js');
var SynonymsAtomizedVersion = require('../models/synonymsAtomized.js');
var CommonNamesAtomizedVersion = require('../models/commonNamesAtomized.js');
var HierarchyVersion = require('../models/hierarchy.js');
var BriefDescriptionVersion = require('../models/briefDescription.js');
var AbstractVersion = require('../models/abstract.js');
var FullDescriptionVersion = require('../models/fullDescription.js');
var IdentificationKeysVersion = require('../models/identificationKeys.js');
var LifeFormVersion = require('../models/lifeForm.js');
var LifeCycleVersion = require('../models/lifeCycle.js');
var ReproductionVersion = require('../models/reproduction.js');
var AnnualCyclesVersion = require('../models/annualCycles.js');
var MolecularDataVersion = require('../models/molecularData.js');
var MigratoryVersion = require('../models/migratory.js');
var add_objects = require('../models/additionalModels.js');
var direct_threats = require('../migration/directThreatsMg.js');
var Schema = mongoose.Schema;



  var editorDb = mongoose.createConnection('mongodb://localhost:27017/editorDb', function(err) {
    if(err) {
      console.log('connection error', err);
    } else {
      console.log('connection successful');
      console.log(Object.keys(editorDb));
      console.log(editorDb.collections);
      console.log(editorDb.otherDbs);
      console.log(editorDb._hasOpened);
      console.log(editorDb._listening);
      var recordSchema = new Schema({name:String}, { strict: false, collection: 'records' });
      var RecordModel = editorDb.model('records', recordSchema);

      async.waterfall([
        function(callback){ 
          
          //RecordModel.find({}).exec(callback);
          MongoClient.connect('mongodb://localhost:27017/editorDb', function (err, db) {
            if (err) {
              console.log(err);
            } 
            else {
                db.collection('Records').find().toArray(function(err, data) {
                console.log(data.length);
                console.log(Object.keys(db));
                console.log(db.databaseName);
                
                //db.close();
                callback(null, data);
              });
            }
          });
        },
        function(data,callback){ 
          var dataN = data;
          console.log("Number of records: "+data.length);
          console.log("***Saving RecordVersion and taxonRecordName***");
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
            taxon_record_name_version.created=record._id.getTimestamp(); //***
            taxon_record_name_version.state="accepted";
            taxon_record_name_version.element="taxonRecordName";
            taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);
            var id_v = taxon_record_name_version._id;
            var id_rc = taxon_record_name_version.id_record;
            var ver = 1; //**
            ob_ids.push(id_v);
            if(typeof  taxon_record_name_version.taxonRecordName!=="undefined" && taxon_record_name_version.taxonRecordName!=""){
              newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
              if(err){
                console.log("Saving taxonRecordName Error!: "+err);
                callback();
              }else{
                taxon_record_name_version.version=1;
                taxon_record_name_version.save(function(err){
                  if(err){
                    console.log("Saving taxonRecordName Error!: "+err);
                    callback();
                  }else{
                    console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    callback();
                  }
                });
              }  
              });
            }else{
              console.log({message: "Empty data in version of the element taxonRecordName, id_record: "+id_rc});
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
          console.log("***Saving directThreats***");
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
            direct_threats_version.created=record._id.getTimestamp(); //***
            direct_threats_version.state="accepted";
            direct_threats_version.element="directThreats";
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
                        callback();
                      }else{
                        direct_threats_version.id_record=id_rc;
                        direct_threats_version.version=doc.directThreatsVersion.length+1;
                        var ver = direct_threats_version.version;
                        direct_threats_version.save(function(err){
                          if(err){
                            console.log("Saving directThreats Error!: "+err);
                            callback();
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
              console.log({message: "Empty data in version of the element directThreats, id_record: "+id_rc});
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
          console.log("***Saving moreInformation***");
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
            more_information_version.created=record._id.getTimestamp(); //***
            more_information_version.state="accepted";
            more_information_version.element="moreInformation";
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
                        callback();
                      }else{
                        more_information_version.id_record=id_rc;
                        more_information_version.version=doc.moreInformationVersion.length+1;
                        var ver = more_information_version.version;
                        more_information_version.save(function(err){
                          if(err){
                            console.log("Saving moreInformation Error!: "+err);
                            callback();
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
              console.log({message: "Empty data in version of the element moreInformation, id_record: "+id_rc});
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
          console.log("***Saving associatedParty***");
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
            associated_party_version.state="accepted";
            associated_party_version.element="associatedParty";
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
                        callback();
                      }else{
                        associated_party_version.id_record=id_rc;
                        associated_party_version.version=doc.associatedPartyVersion.length+1;
                        var ver = associated_party_version.version;
                        associated_party_version.save(function(err){
                          if(err){
                            console.log("Saving associatedParty Error!: "+err);
                            callback();
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
              console.log({message: "Empty data in version of the element associatedParty, id_record: "+id_rc});
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
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var synonymsAtomizedSchema = SynonymsAtomizedVersion.schema;
          var SynonymsAtomizedVersionModel = catalogoDb.model('SynonymsAtomizedVersion', synonymsAtomizedSchema );
          var synonyms_atomized_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var synonyms_atomized_version = {}; 
            synonyms_atomized_version.synonymsAtomized = record._doc.synonymsAtomized;
            synonyms_atomized_version._id = mongoose.Types.ObjectId();
            synonyms_atomized_version.id_record=record._id;
            synonyms_atomized_version.created=record._id.getTimestamp(); //***
            synonyms_atomized_version.state="accepted";
            synonyms_atomized_version.element="synonymsAtomized";
            synonyms_atomized_version = new SynonymsAtomizedVersionModel(synonyms_atomized_version);
            var id_v = synonyms_atomized_version._id;
            var id_rc = synonyms_atomized_version.id_record;
            ob_ids.push(id_v);
            if(typeof  synonyms_atomized_version.synonymsAtomized!=="undefined" && synonyms_atomized_version.synonymsAtomized!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving synonymsAtomized Error!: "+err);
                      }else{
                        synonyms_atomized_version.id_record=id_rc;
                        synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
                        var ver = synonyms_atomized_version.version;
                        synonyms_atomized_version.save(function(err){
                          if(err){
                            console.log("Saving synonymsAtomized Error!: "+err);
                          }else{
                            console.log({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving synonymsAtomized have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var commonNamesAtomizedSchema = CommonNamesAtomizedVersion.schema;
          var CommonNamesAtomizedVersionModel = catalogoDb.model('CommonNamesAtomizedVersion', commonNamesAtomizedSchema );
          var common_names_atomized = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var common_names_atomized = {}; 
            var elementTemp=record._doc.commonNamesAtomized;
            if(typeof  elementTemp!=="undefined" && elementTemp.length!=0){
              common_names_atomized.commonNamesAtomized=elementTemp;
            }else{
              common_names_atomized.commonNamesAtomized=record._doc.commonNameAtomized;
            }
            common_names_atomized._id = mongoose.Types.ObjectId();
            common_names_atomized.id_record=record._id;
            common_names_atomized.created=record._id.getTimestamp(); //***
            common_names_atomized.state="accepted";
            common_names_atomized.element="commonNamesAtomized";
            common_names_atomized = new CommonNamesAtomizedVersionModel(common_names_atomized);
            var id_v = common_names_atomized._id;
            var id_rc = common_names_atomized.id_record;
            ob_ids.push(id_v);
            if(typeof  common_names_atomized.commonNamesAtomized!=="undefined" && common_names_atomized.commonNamesAtomized!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "commonNamesAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving commonNamesAtomized Error!: "+err);
                      }else{
                        common_names_atomized.id_record=id_rc;
                        common_names_atomized.version=doc.commonNamesAtomizedVersion.length+1;
                        var ver = common_names_atomized.version;
                        common_names_atomized.save(function(err){
                          if(err){
                            console.log("Saving commonNamesAtomized Error!: "+err);
                          }else{
                            console.log({ message: 'Save CommonNamesAtomizedVersion', element: 'commonNamesAtomized', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element commonNamesAtomized, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving commonNamesAtomized have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var hierarchySchema = HierarchyVersion.schema;
          var HierarchyVersionModel = catalogoDb.model('HierarchyVersion', hierarchySchema );
          var hierarchy_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var hierarchy_version = {}; 
            hierarchy_version.hierarchy = record._doc.hierarchy;
            hierarchy_version._id = mongoose.Types.ObjectId();
            hierarchy_version.id_record=record._id;
            hierarchy_version.created=record._id.getTimestamp(); //***
            hierarchy_version.state="accepted";
            hierarchy_version.element="hierarchy";
            hierarchy_version = new HierarchyVersionModel(hierarchy_version);
            var id_v = hierarchy_version._id;
            var id_rc = hierarchy_version.id_record;
            ob_ids.push(id_v);
            if(typeof  hierarchy_version.hierarchy!=="undefined" && hierarchy_version.hierarchy!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "hierarchyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving hierarchy Error!: "+err);
                      }else{
                        hierarchy_version.id_record=id_rc;
                        hierarchy_version.version=doc.hierarchyVersion.length+1;
                        var ver = hierarchy_version.version;
                        hierarchy_version.save(function(err){
                          if(err){
                            console.log("Saving hierarchy Error!: "+err);
                          }else{
                            console.log({ message: 'Save HierarchyVersion', element: 'hierarchy', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element hierarchy, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving hierarchy have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var briefDescriptionSchema = BriefDescriptionVersion.schema;
          var BriefDescriptionVersionModel = catalogoDb.model('BriefDescriptionVersion', briefDescriptionSchema );
          var brief_description_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var brief_description_version = {}; 
            brief_description_version.briefDescription = record._doc.briefDescription;
            brief_description_version._id = mongoose.Types.ObjectId();
            brief_description_version.id_record=record._id;
            brief_description_version.created=record._id.getTimestamp(); //***
            brief_description_version.state="accepted";
            brief_description_version.element="briefDescription";
            brief_description_version = new BriefDescriptionVersionModel(brief_description_version);
            var id_v = brief_description_version._id;
            var id_rc = brief_description_version.id_record;
            ob_ids.push(id_v);
            if(typeof  brief_description_version.briefDescription!=="undefined" && brief_description_version.briefDescription!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "briefDescriptionVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving briefDescription Error!: "+err);
                      }else{
                        brief_description_version.id_record=id_rc;
                        brief_description_version.version=doc.briefDescriptionVersion.length+1;
                        var ver = brief_description_version.version;
                        brief_description_version.save(function(err){
                          if(err){
                            console.log("Saving briefDescription Error!: "+err);
                          }else{
                            console.log({ message: 'Save BriefDescriptionVersion', element: 'briefDescription', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element briefDescription, id_record: "+id_rc });
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving element briefDescription have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var abstractSchema = AbstractVersion.schema;
          var AbstractVersionModel = catalogoDb.model('AbstractVersion', abstractSchema );
          var abstract_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var abstract_version = {}; 
            abstract_version.abstract = record._doc.abstract;
            abstract_version._id = mongoose.Types.ObjectId();
            abstract_version.id_record=record._id;
            abstract_version.created=record._id.getTimestamp(); //***
            abstract_version.state="accepted";
            abstract_version.element="abstract";
            abstract_version = new AbstractVersionModel(abstract_version);
            var id_v = abstract_version._id;
            var id_rc = abstract_version.id_record;
            ob_ids.push(id_v);
            if(typeof  abstract_version.abstract!=="undefined" && abstract_version.abstract!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "abstractVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving abstract Error!: "+err);
                      }else{
                        abstract_version.id_record=id_rc;
                        abstract_version.version=doc.abstractVersion.length+1;
                        var ver = abstract_version.version;
                        abstract_version.save(function(err){
                          if(err){
                            console.log("Saving abstract Error!: "+err);
                          }else{
                            console.log({ message: 'Save AbstractVersion', element: 'abstract', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element abstract, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A file failed to process');
              } else {
                console.log('All record for saving abstract have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var fullDescriptionSchema = FullDescriptionVersion.schema;
          var FullDescriptionVersionModel = catalogoDb.model('FullDescriptionVersion', fullDescriptionSchema );
          var full_description_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var full_description_version = {}; 
            full_description_version.fullDescription = record._doc.fullDescription;
            full_description_version._id = mongoose.Types.ObjectId();
            full_description_version.id_record=record._id;
            full_description_version.created=record._id.getTimestamp(); //***
            full_description_version.state="accepted";
            full_description_version.element="fullDescription";
            full_description_version = new FullDescriptionVersionModel(full_description_version);
            var id_v = full_description_version._id;
            var id_rc = full_description_version.id_record;
            ob_ids.push(id_v);
            if(typeof  full_description_version.fullDescription!=="undefined" && full_description_version.fullDescription!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "fullDescriptionVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving fullDescription Error!: "+err);
                      }else{
                        full_description_version.id_record=id_rc;
                        full_description_version.version=doc.fullDescriptionVersion.length+1;
                        var ver = full_description_version.version;
                        full_description_version.save(function(err){
                          if(err){
                            console.log("Saving fullDescription Error!: "+err);
                          }else{
                            console.log({ message: 'Save FullDescriptionVersion', element: 'fullDescription', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element fullDescription, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving fullDescription have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var identificationKeysSchema = IdentificationKeysVersion.schema;
          var IdentificationKeysVersionModel = catalogoDb.model('IdentificationKeysVersion', identificationKeysSchema );
          var identification_keys_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var identification_keys_version = {}; 
            identification_keys_version.identificationKeys = record._doc.identificationKeys;
            identification_keys_version._id = mongoose.Types.ObjectId();
            identification_keys_version.id_record=record._id;
            identification_keys_version.created=record._id.getTimestamp(); //***
            identification_keys_version.state="accepted";
            identification_keys_version.element="identificationKeys";
            identification_keys_version = new IdentificationKeysVersionModel(identification_keys_version);
            var id_v = identification_keys_version._id;
            var id_rc = identification_keys_version.id_record;
            ob_ids.push(id_v);
            if(typeof  identification_keys_version.identificationKeys!=="undefined" && identification_keys_version.identificationKeys!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "identificationKeysVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving identificationKeys Error!: "+err);
                      }else{
                        identification_keys_version.id_record=id_rc;
                        identification_keys_version.version=doc.identificationKeysVersion.length+1;
                        var ver = identification_keys_version.version;
                        identification_keys_version.save(function(err){
                          if(err){
                            console.log("Saving identificationKeys Error!: "+err);
                          }else{
                            console.log({ message: 'Save IdentificationKeysVersion', element: 'identificationKeys', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element identificationKeys, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving identificationKeys have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var lifeFormSchema = LifeFormVersion.schema;
          var LifeFormVersionModel = catalogoDb.model('LifeFormVersion', lifeFormSchema );
          var life_form_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var life_form_version = {}; 
            life_form_version.lifeForm = record._doc.lifeForm;
            life_form_version._id = mongoose.Types.ObjectId();
            life_form_version.id_record=record._id;
            life_form_version.created=record._id.getTimestamp(); //***
            life_form_version.state="accepted";
            life_form_version.element="lifeForm";
            life_form_version = new LifeFormVersionModel(life_form_version);
            var id_v = life_form_version._id;
            var id_rc = life_form_version.id_record;
            ob_ids.push(id_v);
            if(typeof  life_form_version.lifeForm!=="undefined" && life_form_version.lifeForm!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "lifeFormVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving lifeForm Error!: "+err);
                      }else{
                        life_form_version.id_record=id_rc;
                        life_form_version.version=doc.lifeFormVersion.length+1;
                        var ver = life_form_version.version;
                        life_form_version.save(function(err){
                          if(err){
                            console.log("Saving lifeForm Error!: "+err);
                          }else{
                            console.log({ message: 'Save LifeFormVersion', element: 'lifeForm', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element lifeForm, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving lifeForm have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var lifeCycleSchema = LifeCycleVersion.schema;
          var LifeCycleVersionModel = catalogoDb.model('LifeCycleVersion', lifeCycleSchema );
          var life_cycle_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var life_cycle_version = {}; 
            life_cycle_version.lifeCycle = record._doc.lifeCycle;
            life_cycle_version._id = mongoose.Types.ObjectId();
            life_cycle_version.id_record=record._id;
            life_cycle_version.created=record._id.getTimestamp(); //***
            life_cycle_version.state="accepted";
            life_cycle_version.element="lifeCycle";
            life_cycle_version = new LifeCycleVersionModel(life_cycle_version);
            var id_v = life_cycle_version._id;
            var id_rc = life_cycle_version.id_record;
            ob_ids.push(id_v);
            if(typeof  life_cycle_version.lifeCycle!=="undefined" && life_cycle_version.lifeCycle!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "lifeCycleVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving lifeCycle Error!: "+err);
                      }else{
                        life_cycle_version.id_record=id_rc;
                        life_cycle_version.version=doc.lifeCycleVersion.length+1;
                        var ver = life_cycle_version.version;
                        life_cycle_version.save(function(err){
                          if(err){
                            console.log("Saving lifeCycle Error!: "+err);
                          }else{
                            console.log({ message: 'Save LifeCycleVersion', element: 'lifeCycle', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element lifeCycle, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving lifeCycle have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var reproductionSchema = ReproductionVersion.schema;
          var ReproductionVersionModel = catalogoDb.model('ReproductionVersion', reproductionSchema );
          var reproduction_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var reproduction_version = {}; 
            reproduction_version.reproduction = record._doc.reproduction;
            reproduction_version._id = mongoose.Types.ObjectId();
            reproduction_version.id_record=record._id;
            reproduction_version.created=record._id.getTimestamp(); //***
            reproduction_version.state="accepted";
            reproduction_version.element="reproduction";
            reproduction_version = new ReproductionVersionModel(reproduction_version);
            var id_v = reproduction_version._id;
            var id_rc = reproduction_version.id_record;
            ob_ids.push(id_v);
            if(typeof  reproduction_version.reproduction!=="undefined" && reproduction_version.reproduction!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "reproductionVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving reproduction Error!: "+err);
                      }else{
                        reproduction_version.id_record=id_rc;
                        reproduction_version.version=doc.reproductionVersion.length+1;
                        var ver = reproduction_version.version;
                        reproduction_version.save(function(err){
                          if(err){
                            console.log("Saving reproduction Error!: "+err);
                          }else{
                            console.log({ message: 'Save ReproductionVersion', element: 'reproduction', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element reproduction, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving reproduction have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var annualCyclesSchema = AnnualCyclesVersion.schema;
          var AnnualCyclesVersionModel = catalogoDb.model('AnnualCyclesVersion', annualCyclesSchema );
          var annual_cycles_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var annual_cycles_version = {}; 
            var elementTemp=record._doc.annualCycles;
            if(typeof  elementTemp!=="undefined" && elementTemp.length!=0){
              annual_cycles_version.annualCycles=elementTemp;
            }else{
              elementTemp=record._doc.annualCycle;
              elementTemp.annualCyclesAtomized=elementTemp.annualCycleAtomized;
              delete elementTemp.annualCycleAtomized;
              elementTemp.annualCyclesUnstructured=elementTemp.annualCycleUnstructured;
              delete elementTemp.annualCycleUnstructured;
              annual_cycles_version.annualCycles=elementTemp;
            }
            annual_cycles_version._id = mongoose.Types.ObjectId();
            annual_cycles_version.id_record=record._id;
            annual_cycles_version.created=record._id.getTimestamp(); //***
            annual_cycles_version.state="accepted";
            annual_cycles_version.element="annualCycles";
            annual_cycles_version = new AnnualCyclesVersionModel(annual_cycles_version);
            var id_v = annual_cycles_version._id;
            var id_rc = annual_cycles_version.id_record;
            ob_ids.push(id_v);
            if(typeof  annual_cycles_version.annualCycles!=="undefined" && annual_cycles_version.annualCycles!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "annualCyclesVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving annualCycles Error!: "+err);
                      }else{
                        annual_cycles_version.id_record=id_rc;
                        annual_cycles_version.version=doc.annualCyclesVersion.length+1;
                        var ver = annual_cycles_version.version;
                        annual_cycles_version.save(function(err){
                          if(err){
                            console.log("Saving annualCycles Error!: "+err);
                          }else{
                            console.log({ message: 'Save AnnualCyclesVersion', element: 'annualCycles', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element annualCycles, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving annualCycles have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log(data.length);
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var molecularDataSchema = MolecularDataVersion.schema;
          var MolecularDataVersionModel = catalogoDb.model('MolecularDataVersion', molecularDataSchema );
          var molecular_data_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var molecular_data_version = {}; 
            molecular_data_version.molecularData = record._doc.molecularData;
            molecular_data_version._id = mongoose.Types.ObjectId();
            molecular_data_version.id_record=record._id;
            molecular_data_version.created=record._id.getTimestamp(); //***
            molecular_data_version.state="accepted";
            molecular_data_version.element="molecularData";
            molecular_data_version = new MolecularDataVersionModel(molecular_data_version);
            var id_v = molecular_data_version._id;
            var id_rc = molecular_data_version.id_record;
            ob_ids.push(id_v);
            if(typeof  molecular_data_version.molecularData!=="undefined" && molecular_data_version.molecularData!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "molecularDataVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving molecularData Error!: "+err);
                      }else{
                        molecular_data_version.id_record=id_rc;
                        molecular_data_version.version=doc.molecularDataVersion.length+1;
                        var ver = molecular_data_version.version;
                        molecular_data_version.save(function(err){
                          if(err){
                            console.log("Saving molecularData Error!: "+err);
                          }else{
                            console.log({ message: 'Save MolecularDataVersion', element: 'molecularData', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element molecularData, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving molecularData have been processed successfully');
                callback(null, dataN, catalogoDb);
              }
          });
        },
        function(data, catalogoDb,callback){ 
          console.log("***Saving migratory***");
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var migratorySchema = MigratoryVersion.schema;
          var MigratoryVersionModel = catalogoDb.model('MigratoryVersion', migratorySchema );
          var migratory_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var migratory_version = {}; 
            migratory_version.migratory = record._doc.migratory;
            migratory_version._id = mongoose.Types.ObjectId();
            migratory_version.id_record=record._id;
            migratory_version.created=record._id.getTimestamp(); //***
            migratory_version.state="accepted";
            migratory_version.element="migratory";
            migratory_version = new MigratoryVersionModel(migratory_version);
            var id_v = migratory_version._id;
            var id_rc = migratory_version.id_record;
            ob_ids.push(id_v);
            if(typeof  migratory_version.migratory!=="undefined" && migratory_version.migratory!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "migratoryVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving migratory Error!: "+err);
                        callback();
                      }else{
                        migratory_version.id_record=id_rc;
                        migratory_version.version=doc.migratoryVersion.length+1;
                        var ver = migratory_version.version;
                        migratory_version.save(function(err){
                          if(err){
                            console.log("Saving migratory Error!: "+err);
                            callback();
                          }else{
                            console.log({ message: 'Save MigratoryVersion', element: 'migratory', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element migratory, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving migratory have been processed successfully');
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





