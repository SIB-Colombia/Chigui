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

//query = add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1}).limit(1);
query = add_objects.RecordVersion.find({}).select('_id').sort({ _id: -1});

var lastRec ={};

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

      var commonNamesAtomizedSchema = CommonNamesAtomizedVersion.schema;
      CommonNamesAtomizedVersion = catalogoDb.model('CommonNamesAtomizedVersion', commonNamesAtomizedSchema );

      var synonymsAtomizedSchema = SynonymsAtomizedVersion.schema;
      SynonymsAtomizedVersion = catalogoDb.model('SynonymsAtomizedVersion', synonymsAtomizedSchema );

      var lifeCycleSchema = LifeCycleVersion.schema;
      LifeCycleVersion =  catalogoDb.model('LifeCycleVersion', lifeCycleSchema );

      var lifeFormSchema = LifeFormVersion.schema;
      LifeFormVersion =  catalogoDb.model('LifeFormVersion', lifeFormSchema );

      var identificationKeysSchema = IdentificationKeysVersion.schema;
      IdentificationKeysVersion = catalogoDb.model('IdentificationKeysVersion', identificationKeysSchema );

      var fullDescriptionSchema = FullDescriptionVersion.schema;
      FullDescriptionVersion = catalogoDb.model('FullDescriptionVersion', fullDescriptionSchema );

      var briefDescriptionSchema = BriefDescriptionVersion.schema;
      BriefDescriptionVersion = catalogoDb.model('BriefDescriptionVersion', briefDescriptionSchema );

      var abstractSchema = AbstractVersion.schema;
      AbstractVersion = catalogoDb.model('AbstractVersion', abstractSchema );

      var hierarchySchema = HierarchyVersion.schema;
      HierarchyVersion = catalogoDb.model('HierarchyVersion', hierarchySchema );

      var reproductionSchema = ReproductionVersion.schema;
      ReproductionVersion = catalogoDb.model('ReproductionVersion', reproductionSchema );

      var annualCyclesSchema = AnnualCyclesVersion.schema;
      AnnualCyclesVersion = catalogoDb.model('AnnualCyclesVersion', annualCyclesSchema );

      var feedingSchema = FeedingVersion.schema;
      FeedingVersion = catalogoDb.model('FeedingVersion', feedingSchema );

      var dispersalSchema = DispersalVersion.schema;
      DispersalVersion = catalogoDb.model('DispersalVersion', dispersalSchema );

      var behaviorSchema = BehaviorVersion.schema;
      BehaviorVersion = catalogoDb.model('BehaviorVersion', behaviorSchema );

      var interactionsSchema = InteractionsVersion.schema;
      InteractionsVersion = catalogoDb.model('InteractionsVersion', interactionsSchema );

      var molecularDataSchema = MolecularDataVersion.schema;
      MolecularDataVersion = catalogoDb.model('MolecularDataVersion', molecularDataSchema );

      var migratorySchema = MigratoryVersion.schema;
      MigratoryVersion = catalogoDb.model('MigratoryVersion', migratorySchema );

      var habitatsSchema = HabitatsVersion.schema;
      HabitatsVersion = catalogoDb.model('HabitatsVersion', habitatsSchema );

      var distributionSchema = DistributionVersion.schema;
      DistributionVersion = catalogoDb.model('DistributionVersion', distributionSchema );

      var territorySchema = TerritoryVersion.schema;
      TerritoryVersion = catalogoDb.model('TerritoryVersion', territorySchema );

      var populationBiologySchema = PopulationBiologyVersion.schema;
      PopulationBiologyVersion = catalogoDb.model('PopulationBiologyVersion', populationBiologySchema );

      var moreInformationSchema = MoreInformationVersion.schema;
      MoreInformationVersion = catalogoDb.model('MoreInformationVersion', moreInformationSchema );

      var threatStatusSchema = ThreatStatusVersion.schema;
      ThreatStatusVersion = catalogoDb.model('ThreatStatusVersion', threatStatusSchema );

      var legislationSchema = LegislationVersion.schema;
      LegislationVersion = catalogoDb.model('LegislationVersion', legislationSchema );

      var usesManagementAndConservationSchema = UsesManagementAndConservationVersion.schema;
      UsesManagementAndConservationVersion = catalogoDb.model('UsesManagementAndConservationVersion', usesManagementAndConservationSchema );

      var directThreatsSchema = DirectThreatsVersion.schema;
      DirectThreatsVersion = catalogoDb.model('DirectThreatsVersion', directThreatsSchema );

      var ancillaryDataSchema = AncillaryDataVersion.schema;
      AncillaryDataVersion = catalogoDb.model('AncillaryDataVersion', ancillaryDataSchema );

      var endemicAtomizedSchema = EndemicAtomizedVersion.schema;
      EndemicAtomizedVersion = catalogoDb.model('EndemicAtomizedVersion', endemicAtomizedSchema );

      var referencesSchema = ReferencesVersion.schema;
      ReferencesVersion = catalogoDb.model('ReferencesVersion', referencesSchema );

      var environmentalEnvelopeSchema = EnvironmentalEnvelopeVersion.schema;
      EnvironmentalEnvelopeVersion = catalogoDb.model('EnvironmentalEnvelopeVersion', environmentalEnvelopeSchema );

      var ecologicalSignificanceSchema = EcologicalSignificanceVersion.schema;
      EcologicalSignificanceVersion = catalogoDb.model('EcologicalSignificanceVersion', ecologicalSignificanceSchema );

      var InvasivenessSchema = InvasivenessVersion.schema;
      InvasivenessVersion = catalogoDb.model('InvasivenessVersion', InvasivenessSchema );


    	async.waterfall([
    		function(callback){
    			console.log("***!Execution of the query***");
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
    				console.log(record_data._id);
            //record_data._id = "56702bfef289f5a40c0cd2ac";
            async.waterfall([
              function(callback){
                //console.log("! "+record_data);
                TaxonRecordNameVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get TaxonRecordName element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.taxonRecordName = elementVer.taxonRecordName;
                    }
                    //console.log("!!"+lastRec.taxonRecordName);
                    callback();
                  }
                });
              },
              function(callback){
                //console.log("!*");
                AssociatedPartyVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AssociatedParty element for the record with id: "+record_data._id+" : " + err.message));
                  }else{ 
                    if(elementVer){
                      lastRec.associatedParty=elementVer.associatedParty;
                    }else{
                      lastRec.associatedParty="";
                    }
                    //console.log("!!"+lastRec.associatedParty);
                    callback();
                  }
                });
              },
              function(callback){
                CommonNamesAtomizedVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    console.log(err);
                    callback(new Error("Error to get CommonNamesAtomized element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.commonNamesAtomized = elementVer.commonNamesAtomized;
                    }else{
                      lastRec.commonNamesAtomized = "";
                    }
                    //console.log("!!!"+lastRec.commonNamesAtomized);
                    callback();
                  }
                });
              },
              function(callback){
                SynonymsAtomizedVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get SynonymsAtomized element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.synonymsAtomized = elementVer.synonymsAtomized;
                    }else{
                      lastRec.synonymsAtomized = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.synonymsAtomized);
                    callback();
                  }
                });
              },
              function(callback){
                LifeCycleVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get LifeCycle element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.lifeCycle = elementVer.lifeCycle;
                    }else{
                      lastRec.lifeCycle = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.lifeCycle);
                    callback();
                  }
                });
              },
              function(callback){
                LifeFormVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get LifeForm element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.lifeForm = elementVer.lifeForm;
                    }else{
                      lastRec.lifeForm = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.lifeForm);
                    callback();
                  }
                });
              },
              function(callback){
                IdentificationKeysVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get IdentificationKeys element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.identificationKeys=elementVer.identificationKeys;
                    }else{
                      lastRec.identificationKeys = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.identificationKeys);
                    callback();
                  }
                });
              },
              function(callback){
                FullDescriptionVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get FullDescription element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.fullDescription = elementVer.fullDescription;
                    }else{
                      lastRec.fullDescription = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.fullDescription);
                    callback();
                  }
                });
              },
              function(callback){
                BriefDescriptionVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get BriefDescription element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.briefDescription = elementVer.briefDescription;
                    }else{
                      lastRec.briefDescription = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.briefDescription);
                    callback();
                  }
                });
              },
              function(callback){
                AbstractVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Abstract element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.abstract = elementVer.abstract;
                    }else{
                      lastRec.abstract = ""; //***** quitar después
                    }
                    //console.log("!!!"+lastRec.abstract);
                    callback();
                  }
                });
              },
              function(callback){
                HierarchyVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Hierarchy element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.hierarchy=elementVer.hierarchy;
                    }
                    //console.log("!!!"+lastRec.hierarchy);
                    callback();
                  }
                });
              },
              function(callback){
                ReproductionVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Reproduction element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.reproduction = elementVer.reproduction;
                    }else{
                      lastRec.reproduction = "";
                    }
                    //console.log("!!!"+lastRec.reproduction);
                    callback();
                  }
                });
              },
              function(callback){
                AnnualCyclesVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AnnualCycles element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.annualCycles = elementVer.annualCycles;
                    }else{
                      lastRec.annualCycles = "";
                    }
                    //console.log("!!!"+lastRec.annualCycles);
                    callback();
                  }
                });
              },
              function(callback){
                FeedingVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Feeding element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.feeding = elementVer.feeding;
                    }else{
                      lastRec.feeding = "";
                    }
                    //console.log("!!!"+lastRec.feeding);
                    callback();
                  }
                });
              },
              function(callback){
                DispersalVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Dispersal element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.dispersal = elementVer.dispersal;
                    }else{
                      lastRec.dispersal = "";
                    }
                    //console.log("!!!"+lastRec.dispersal);
                    callback();
                  }
                });
              },
              function(callback){
                BehaviorVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Behavior element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.behavior = elementVer.behavior;
                    }else{
                      lastRec.behavior = "";
                    }
                    //console.log("!!!"+lastRec.behavior);
                    callback();
                  }
                });
              },
              function(callback){
                InteractionsVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Interactions element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.interactions = elementVer.interactions;
                    }else{
                      lastRec.interactions = "";
                    }
                    //console.log("!!!"+lastRec.interactions);
                    callback();
                  }
                });
              },
              function(callback){
                MolecularDataVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get MolecularData element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.molecularData = elementVer.molecularData;
                    }else{
                      lastRec.molecularData = "";
                    }
                    //console.log("!!!"+lastRec.molecularData);
                    callback();
                  }
                });
              },
              function(callback){
                MigratoryVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Migratory element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.migratory = elementVer.migratory;
                    }else{
                      lastRec.migratory = "";
                    }
                    //console.log("!!!"+lastRec.migratory);
                    callback();
                  }
                });
              },
              function(callback){
                HabitatsVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Habitats element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.habitats = elementVer.habitats;
                    }else{
                      lastRec.habitats = "";
                    }
                    //console.log("!!!"+lastRec.habitats);
                    callback();
                  }
                });
              },
              function(callback){
                DistributionVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Distribution element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.distribution = elementVer.distribution;
                    }else{
                      lastRec.distribution = "";
                    }
                    //console.log("!!!"+lastRec.distribution);
                    callback();
                  }
                });
              },
              function(callback){
                TerritoryVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Territory element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.territory = elementVer.territory;
                    }else{
                      lastRec.territory = "";
                    }
                    //console.log("!!!"+lastRec.territory);
                    callback();
                  }
                });
              },
              function(callback){
                PopulationBiologyVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get PopulationBiology element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.populationBiology = elementVer.populationBiology;
                    }else{
                      lastRec.populationBiology = "";
                    }
                    //console.log("!!!"+lastRec.populationBiology);
                    callback();
                  }
                });
              },
              function(callback){
                MoreInformationVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get PopulationBiology element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.moreInformation = elementVer.moreInformation;
                    }else{
                      lastRec.moreInformation = "";
                    }
                    //console.log("!!!"+lastRec.moreInformation);
                    callback();
                  }
                });
              },
              function(callback){
                ThreatStatusVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get ThreatStatus element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.threatStatus = elementVer.threatStatus;
                    }else{
                      lastRec.threatStatus = "";
                    }
                    //console.log("!!!"+lastRec.threatStatus);
                    callback();
                  }
                });
              },
              function(callback){
                LegislationVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Legislation element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.legislation = elementVer.legislation;
                    }else{
                      lastRec.legislation = "";
                    }
                    //console.log("!!!"+lastRec.legislation);
                    callback();
                  }
                });
              },
              function(callback){
                UsesManagementAndConservationVersion.findOne({ "id_record" : mongoose.Types.ObjectId(record_data._id), state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get UsesManagementAndConservation element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.usesManagementAndConservation = elementVer._doc.usesManagementAndConservation;
                    }else{
                      lastRec.usesManagementAndConservation = "";
                    }
                    //console.log("!!!"+lastRec.usesManagementAndConservation);
                    //console.log("!!!"+Object.keys(lastRec.usesManagementAndConservation));
                    //console.log("!!!"+JSON.stringify(lastRec.usesManagementAndConservation));
                    callback();
                  }
                });
              },
              function(callback){
                DirectThreatsVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get DirectThreats element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.directThreats = elementVer.directThreats;
                    }else{
                      lastRec.directThreats = "";
                    }
                    //console.log("!!!"+lastRec.directThreats);
                    callback();
                  }
                });
              },
              function(callback){
                AncillaryDataVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get AncillaryData element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.ancillaryData = elementVer.ancillaryData;
                    }else{
                      lastRec.ancillaryData = "";
                    }
                    //console.log("!!!"+lastRec.ancillaryData);
                    callback();
                  }
                });
              },
              function(callback){
                EndemicAtomizedVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EndemicAtomized element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.endemicAtomized = elementVer.endemicAtomized;
                    }else{
                      lastRec.endemicAtomized = "";
                    }
                    //console.log("!!!"+lastRec.endemicAtomized);
                    callback();
                  }
                });
              },
              function(callback){
                ReferencesVersion.findOne({ "id_record" : mongoose.Types.ObjectId(record_data._id), state: "accepted" }).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get References element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.references = elementVer.references;
                    }else{
                      lastRec.references = "";
                    }
                    //console.log("!!!"+lastRec.references);
                    callback();
                  }
                });
              },
              function(callback){
                EnvironmentalEnvelopeVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EnvironmentalEnvelope element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.environmentalEnvelope = elementVer.environmentalEnvelope;
                    }else{
                      lastRec.environmentalEnvelope = "";
                    }
                    //console.log("!!!"+lastRec.environmentalEnvelope);
                    callback();
                  }
                  });
                },
              function(callback){
                EcologicalSignificanceVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get EcologicalSignificance element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.ecologicalSignificance = elementVer.ecologicalSignificance;
                    }else{
                      lastRec.ecologicalSignificance = "";
                    }
                    //console.log("!!!"+lastRec.ecologicalSignificance);
                    callback();
                  }
                });
              },
              function(callback){
                InvasivenessVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
                  if(err){
                    callback(new Error("Error to get Invasiveness element for the record with id: "+record_data._id+" : " + err.message));
                  }else{
                    if(elementVer){
                      lastRec.invasiveness = elementVer.invasiveness;
                    }else{
                      lastRec.invasiveness = "";
                    }
                    //console.log("!!!"+lastRec.invasiveness);
                    console.log("!!!");
                    callback();
                  }
                });
              },
              function(callback){
                //console.log(lastRec);
                RecordModel.update({ _id: record_data._id }, { $set: { lastVersion: lastRec }}, function (err, raw){
                  if(err){
                    callback(new Error(err.message));
                  }else{
                    //console.log("updated");
                    //console.log("response: "+raw);
                    callback();
                  }
                });
              }
            ],function(err, result) {
              if(err){
                callback(new Error("Error"));
              }else{
                //console.log("ok");
                callback();
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
    		},
        function(data,callback){
	    		console.log("End cascade");
	    	}
	    	],
    	   function(err, result) {
      		if(err){
        		console.log(err);
      		}else{
        		console.log("End of the process");
        		//logger.info('Creation a new AncillaryDataVersion sucess', JSON.stringify({id_record: record_data._id, version: ver, _id: id_v, id_user: user}));
        		//res.json("End of the process");
      		}
    	});
    }

});