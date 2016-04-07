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
var EcologicalSignificanceVersion = require('../models/ecologicalSignificance.js');
var EnvironmentalEnvelopeVersion = require('../models/environmentalEnvelope.js');
var InvasivenessVersion = require('../models/invasiveness.js');
var FeedingVersion = require('../models/feeding.js');
var DispersalVersion = require('../models/dispersal.js');
var BehaviorVersion = require('../models/behavior.js');
var InteractionsVersion = require('../models/interactions.js');
var HabitatsVersion = require('../models/habitats.js');
var DistributionVersion = require('../models/distribution.js');
var TerritoryVersion = require('../models/territory.js');
var PopulationBiologyVersion = require('../models/populationBiology.js');
var ThreatStatusVersion = require('../models/threatStatus.js');
var LegislationVersion = require('../models/legislation.js');
var UsesManagementAndConservationVersion = require('../models/usesManagementAndConservation.js');
var ReferencesVersion = require('../models/references.js');
var AncillaryDataVersion = require('../models/ancillaryData.js');
var EndemicAtomizedVersion = require('../models/endemicAtomized.js');
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
        function(data, catalogoDb,callback){ 
          console.log("Number of records: "+data.length);
          console.log("***Saving behavior***");
          var catalogoDb=editorDb.useDb("catalogoDb");
          var dataN = data;
          var newRecordSchema = add_objects.RecordVersion.schema;
          var newRecordModel = catalogoDb.model('RecordVersion', newRecordSchema );

          var behaviorSchema = BehaviorVersion.schema;
          var BehaviorVersionModel = catalogoDb.model('BehaviorVersion', behaviorSchema );
          var behavior_version = {}; 
          var ob_ids= new Array();
          async.eachSeries(data, function(record, callback) {
            var behavior_version = {}; 
            behavior_version.behavior = record._doc.behavior;
            behavior_version._id = mongoose.Types.ObjectId();
            behavior_version.id_record=record._id;
            behavior_version.created=record._id.getTimestamp(); //***
            behavior_version.state="accepted";
            behavior_version.element="behavior";
            behavior_version = new BehaviorVersionModel(behavior_version);
            var id_v = behavior_version._id;
            var id_rc = behavior_version.id_record;
            ob_ids.push(id_v);
            if(typeof  behavior_version.behavior!=="undefined" && behavior_version.behavior!=""){
              newRecordModel.count({ _id : id_rc }, function (err, count){
                if(typeof count!=="undefined"){
                  if(count==0){
                    console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  }else{
                    newRecordModel.findByIdAndUpdate( id_rc, { $push: { "behaviorVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      if (err){
                        console.log("Saving behavior Error!: "+err);
                        callback();
                      }else{
                        behavior_version.id_record=id_rc;
                        behavior_version.version=doc.behaviorVersion.length+1;
                        var ver = behavior_version.version;
                        behavior_version.save(function(err){
                          if(err){
                            console.log("Saving behavior Error!: "+err);
                            callback();
                          }else{
                            console.log({ message: 'Save BehaviorVersion', element: 'behavior', version : ver, _id: id_v, id_record : id_rc });
                            callback();
                          }
                        });
                      }
                    });
                  }
                }
              });
            }else{
              console.log({message: "Empty data in version of the element behavior, id_record: "+id_rc});
              callback();
            }
          },function(err){
              if( err ) {
                console.log('A record failed to process');
              } else {
                console.log('All record for saving behavior have been processed successfully');
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
