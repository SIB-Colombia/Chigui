var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var AssociatedPartyVersion = require('../models/associatedParty.js');
var add_objects = require('../models/additionalModels.js');

var value={};
var response=[];
var dataObject ={};

//query = add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1}).limit(1);
query = add_objects.RecordVersion.find({}).select('_id').sort({ _id: -1});

var catalogoDb = mongoose.createConnection('mongodb://localhost:27017/catalogoDb', function(err) {
	if(err) {
    	console.log('connection error', err);
    }else{
    	console.log('connection successful');
    	//var RecordVersion = mongoose.model('RecordVersion').schema;

    	var RecordSchema = add_objects.RecordVersion.schema;
      var RecordModel = catalogoDb.model('RecordVersion', RecordSchema );

      var taxonSchema = TaxonRecordNameVersion.schema;
      TaxonRecordNameVersion = catalogoDb.model('TaxonRecordNameVersion', taxonSchema );

      var associatedPartySchema = AssociatedPartyVersion.schema;
      AssociatedPartyVersion = catalogoDb.model('AssociatedPartyVersion', associatedPartySchema );

    	async.waterfall([
    		function(callback){
    			console.log("***Execution of the query***");
    			query = RecordModel.find({}).select('_id').sort({ _id: -1});
    			query.exec(function (err, data) {
        			if(err){
          				callback(new Error("Error getting the total of Records:" + err.message));
        			}else{
          				callback(null, data);
        			}
      			});
    		},
    		function(data,callback){
    			//console.log(data.length);
    			async.eachSeries(data, function(record_data, callback){
    				//console.log(record_data._id);
            async.waterfall([
              function(data,callback){
                TaxonRecordNameVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get TaxonRecordName element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.taxonRecordName = elementVer.taxonRecordName;
                    }
                    callback();
                  }
                });
              },
              function(data,callback){
                AssociatedPartyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AssociatedParty element for the record with id: "+id_rc+" : " + err.message));
                  }else{ 
                    if(elementVer){
                      lastRec.associatedParty=elementVer.associatedParty;
                    }
                  callback();
                  }
                });
              },
              function(callback){
                CommonNamesAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get CommonNamesAtomized element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.commonNamesAtomized = elementVer.commonNamesAtomized;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                SynonymsAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get SynonymsAtomized element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.synonymsAtomized = elementVer.synonymsAtomized;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                LifeCycleVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get LifeCycle element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.lifeCycle = elementVer.lifeCycle;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                LifeFormVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get LifeForm element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.lifeForm = elementVer.lifeForm;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                LifeFormVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get LifeForm element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.lifeForm = elementVer.lifeForm;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                IdentificationKeysVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get IdentificationKeys element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.identificationKeys=elementVer.identificationKeys;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                FullDescriptionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get FullDescription element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.fullDescription = elementVer.fullDescription;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                BriefDescriptionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get BriefDescription element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.briefDescription=elementVer.briefDescription;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                AbstractVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Abstract element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.abstract = elementVer.abstract;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                HierarchyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Hierarchy element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.hierarchy=elementVer.hierarchy;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                ReproductionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Reproduction element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.reproduction = elementVer.reproduction;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                AnnualCyclesVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AnnualCycles element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.annualCycles = elementVer.annualCycles;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                FeedingVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Feeding element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.feeding = elementVer.feeding;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                DispersalVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Dispersal element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.dispersal = elementVer.dispersal;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                BehaviorVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Behavior element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.behavior = elementVer.behavior;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                InteractionsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Interactions element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.interactions = elementVer.interactions;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                MolecularDataVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get MolecularData element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.molecularData = elementVer.molecularData;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                MigratoryVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Migratory element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.migratory = elementVer.migratory;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                HabitatsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Habitats element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.habitats = elementVer.habitats;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                DistributionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Distribution element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.distribution = elementVer.distribution;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                TerritoryVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Territory element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.territory = elementVer.territory;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                PopulationBiologyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get PopulationBiology element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.populationBiology = elementVer.populationBiology;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                MoreInformationVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get PopulationBiology element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.moreInformation = elementVer.moreInformation;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                ThreatStatusVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get ThreatStatus element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.threatStatus = elementVer.threatStatus;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                LegislationVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Legislation element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.legislation = elementVer.legislation;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                UsesManagementAndConservationVersion.findOne({ "id_record" : mongoose.Types.ObjectId(id_rc), state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get UsesManagementAndConservation element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.usesManagementAndConservation = elementVer._doc.usesManagementAndConservation;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                DirectThreatsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get DirectThreats element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.directThreats = elementVer.directThreats;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                AncillaryDataVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AncillaryData element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.ancillaryData = elementVer.ancillaryData;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                EndemicAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EndemicAtomized element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.endemicAtomized = elementVer.endemicAtomized;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                ReferencesVersion.findOne({ "id_record" : mongoose.Types.ObjectId(id_rc), state: "accepted" }).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get References element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.references = elementVer.references;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                EnvironmentalEnvelopeVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EnvironmentalEnvelope element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.environmentalEnvelope = elementVer.environmentalEnvelope;
                    }
                    callback();
                  }
                  });
                },
              function(callback){
                EcologicalSignificanceVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EcologicalSignificance element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.ecologicalSignificance = elementVer.ecologicalSignificance;
                    }
                    callback();
                  }
                });
              },
              function(callback){
                InvasivenessVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Invasiveness element for the record with id: "+id_rc+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.invasiveness = elementVer.invasiveness;
                    }
                    callback();
                  }
                });
              }
            ],function(err, result) {
              if(err){
                res.status(400);
                res.json({ ErrorResponse: {message: ""+err }});
              }else{
                console.log("ok");
                //logger.info('Creation a new AncillaryDataVersion sucess', JSON.stringify({id_record: id_rc, version: ver, _id: id_v, id_user: user}));
                res.json("Ok");
              }
            });
    				
    			},function(err){
    				if(err){
          				callback(new Error("Error"));
        			}else{
          				callback(null, data);
        			}
    			});
    			//callback(null, data);
    		}function(data,callback){
	    		console.log(data.length);
	    	}
	    	],
    	function(err, result) {
      		if(err){
        		res.status(400);
        		res.json({ ErrorResponse: {message: ""+err }});
      		}else{
        		console.log("ok");
        		//logger.info('Creation a new AncillaryDataVersion sucess', JSON.stringify({id_record: id_rc, version: ver, _id: id_v, id_user: user}));
        		res.json("Ok");
      		}
    	});
    }

});