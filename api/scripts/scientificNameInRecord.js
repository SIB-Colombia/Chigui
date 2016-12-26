var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var AssociatedPartyVersion = require('../models/associatedParty.js');
var BaseElementsVersion = require('../models/baseElements.js');
var CommonNamesAtomizedVersion = require('../models/commonNamesAtomized.js');
var SynonymsAtomizedVersion = require('../models/synonymsAtomized.js');
var LifeCycleVersion = require('../models/lifeCycle.js');
var LifeFormVersion = require('../models/lifeForm.js');
var IdentificationKeysVersion = require('../models/identificationKeys.js');
var FullDescriptionVersion = require('../models/fullDescription.js');
var BriefDescriptionVersion = require('../models/briefDescription.js');
var AbstractVersion = require('../models/abstract.js');
var HierarchyVersion = require('../models/hierarchy.js');
var ReproductionVersion = require('../models/reproduction.js');
var AnnualCyclesVersion = require('../models/annualCycles.js');
var FeedingVersion = require('../models/feeding.js');
var DispersalVersion = require('../models/dispersal.js');
var BehaviorVersion = require('../models/behavior.js');
var InteractionsVersion = require('../models/interactions.js');
var MolecularDataVersion = require('../models/molecularData.js');
var MigratoryVersion = require('../models/migratory.js');
var HabitatsVersion = require('../models/habitats.js');
var DistributionVersion = require('../models/distribution.js');
var TerritoryVersion = require('../models/territory.js');
var PopulationBiologyVersion = require('../models/populationBiology.js');
var MoreInformationVersion = require('../models/moreInformation.js');
var ThreatStatusVersion = require('../models/threatStatus.js');
var LegislationVersion = require('../models/legislation.js');
var UsesManagementAndConservationVersion = require('../models/usesManagementAndConservation.js');
var DirectThreatsVersion = require('../models/directThreats.js');
var AncillaryDataVersion = require('../models/ancillaryData.js');
var EndemicAtomizedVersion = require('../models/endemicAtomized.js');
var ReferencesVersion = require('../models/references.js');
var EnvironmentalEnvelopeVersion = require('../models/environmentalEnvelope.js');
var EcologicalSignificanceVersion = require('../models/ecologicalSignificance.js');
var InvasivenessVersion = require('../models/invasiveness.js');
var add_objects = require('../models/additionalModels.js');

var value={};
var response=[];
var dataObject ={};


var query = add_objects.RecordVersion.find({ }).select('_id').sort({ _id: -1});

var catalogoDb = mongoose.createConnection('mongodb://localhost:27017/catalogoDb', function(err) {
	if(err){
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
    				TaxonRecordNameVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
    					if(err){
    						callback(new Error("Error to get TaxonRecordName element for the record with id: "+id_rc+" : " + err.message));
    					}else{
    						if(elementVer){
    							if(typeof elementVer.taxonRecordName.scientificName.simple != 'undefined' && elementVer.taxonRecordName.scientificName.simple != ''){
    								//console.log(elementVer.taxonRecordName.scientificName.simple);
    								record_data.scientificName = elementVer.taxonRecordName.scientificName.simple;
    							}
    						}else{
    							record_data.scientificName = "";
    							
    						}
    						callback();
    					}
    				});
    			},function(err){
    				if(err){
          				callback(new Error("Error getting all scientificNames"));
        			}else{
          				callback(null, data);
        			}
    			});
    			//callback(null, data);
    		},
    		function(data,callback){
    			async.eachSeries(data, function(record_data, callback){
    				AssociatedPartyVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
	            		if(err){
	              			callback(new Error("Error to get AssociatedParty element for the record with id: "+id_rc+" : " + err.message));
             			}else{ 
              				if(elementVer){
              					if(typeof elementVer.associatedParty[0].firstName != 'undefined' && elementVer.associatedParty[0].firstName != ''){
    								record_data.firstName = elementVer.associatedParty[0].firstName;
    							}
    							if(typeof elementVer.associatedParty[0].lastName != 'undefined' && elementVer.associatedParty[0].lastName != ''){
    								record_data.lastName = elementVer.associatedParty[0].lastName;
    							}
              				}else{
              					record_data.firstName = "";
              					record_data.lastName = "";
              				}
              				callback();
            			}
          			});
	    		},function(err){
    				if(err){
          				callback(new Error("Error getting all associatedParty elements: "+err));
        			}else{
        				console.log("a");
          				callback(null, data);
        			}
    			});
    			//callback(null, data);
	    	},
	    	function(data,callback){
	    		console.log(data.length);
	    		async.eachSeries(data, function(record_data, callback){
	    			console.log(record_data._id);
	    			console.log(record_data.scientificName);
	    			console.log(record_data.firstName);
	    			console.log(record_data.lastName);
	    			RecordModel.update({ _id: record_data._id }, { $set: { scientificName: record_data.scientificName, associatedParty_firstName: record_data.firstName, associatedParty_lastName: record_data.lastName}}, function (err, raw){
	    				if(err){
            				callback(new Error(err.message));
          				}else{
            				console.log("response: "+raw);
            				callback();
          				}
	    			});
	    		},function(err){
    				if(err){
          				callback(new Error("Error: "+err));
        			}else{
          				callback(null, data);
        			}
    			});
	    	},function(data,callback){
	    		console.log(data.length);
          catalogoDb=mongoose.disconnect();
	    	}
	    	],
    	function(err, result) {
      		if(err){
        		console.log("Error procesing all Records: "+err);
      		}else{
        		console.log("done!");
      		}
    	});
    }

});