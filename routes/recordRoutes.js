var express = require('express');
var mongoosePaginate = require('mongoose-paginate');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../app/models/taxonRecordName.js');
var AssociatedPartyVersion = require('../app/models/associatedParty.js');
var add_objects = require('../app/models/additionalModels.js');
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var cors = require;

RecordVersion.plugin(mongoosePaginate);

var exports = module.exports = {};

exports.getRecord = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion').exec(function (err, record) {
	//console.log(record);
    if(record){
  		if (err){
  			res.send(err);
  		}
  		res.json(record);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};

exports.getRecordLast = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  var lastRec={};
  //add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion').exec(function (err, record) {
    add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion molecularDataVersion migratoryVersion habitatsVersion distributionVersion territoryVersion populationBiologyVersion moreInformationVersion threatStatusVersion legislationVersion usesManagementAndConservationVersion directThreatsVersion ancillaryDataVersion endemicAtomizedVersion referencesVersion environmentalEnvelopeVersion ecologicalSignificanceVersion invasivenessVersion').exec(function (err, record) {
  //console.log(record);
    if(record){
      if (err){
        res.send(err);
      }
      /*
      var len=record.identificationKeysVersion.length;
      if(ver<=len && ver>0){
        res.json(record.identificationKeysVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
      */
      lastRec._id=record._id;
      var lenAsPar=record.associatedPartyVersion.length;
      var lenBasEl=record.baseElementsVersion.length;
      var lenComNameAt=record.commonNamesAtomizedVersion.length;
      var lenSyAt=record.synonymsAtomizedVersion.length;
      var lenTaxRecNam=record.taxonRecordNameVersion.length;
      var lenLifCyc= record.lifeCycleVersion.length;
      var lenLifFor= record.lifeFormVersion.length; 
      var lenIdeKey= record.identificationKeysVersion.length;
      var lenFulDes= record.fullDescriptionVersion.length;
      var lenBrfDes= record.briefDescriptionVersion.length;
      var lenAbs= record.abstractVersion.length;
      var lenHie= record.hierarchyVersion.length;
      var lenRep= record.reproductionVersion.length; 
      var lenAnnCyc= record.annualCyclesVersion.length;
      var lenFed= record.feedingVersion.length;
      var lenDis= record.dispersalVersion.length;
      var lenBeh= record.behaviorVersion.length; 
      var lenInt=record.interactionsVersion.length;
    //
      var lenMolDat=record.molecularDataVersion.length; 
      var lenMig = record.migratoryVersion.length; 
      var lenHab = record.habitatsVersion.length; 
      var lenDistr = record.distributionVersion.length; 
      var lenTerr = record.territoryVersion.length; 
      var lenPopBio = record.populationBiologyVersion.length; 
      var lenMorInf = record.moreInformationVersion.length; 
      var lenThrSta = record.threatStatusVersion.length; 
      var lenLegs = record.legislationVersion.length;
      var lenUseCon = record.usesManagementAndConservationVersion.length;
      var lenDirThr = record.directThreatsVersion.length;
      var lenAncDat = record.ancillaryDataVersion.length;
      var lenEndAt = record.endemicAtomizedVersion.length;
      var lenRefe = record.referencesVersion.length; 
      var lenEnv = record.environmentalEnvelopeVersion.length;
      var lenEcol = record.ecologicalSignificanceVersion.length;
      var lenInva = record.invasivenessVersion.length;


    if(typeof record.associatedPartyVersion[lenAsPar-1]!=="undefined"){
      lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1].associatedParty;
    }

    if(typeof record.baseElementsVersion[lenBasEl-1]!=="undefined"){
      lastRec.baseElements=record.baseElementsVersion[lenBasEl-1].baseElements;
    }

    if(typeof record.commonNamesAtomizedVersion[lenComNameAt-1]!=="undefined"){
      lastRec.commonNamesAtomized=record.commonNamesAtomizedVersion[lenComNameAt-1].commonNamesAtomized;
    }

    if(typeof record.synonymsAtomizedVersion[lenSyAt-1]!=="undefined"){
      lastRec.synonymsAtomized=record.synonymsAtomizedVersion[lenSyAt-1].synonymsAtomized;
    }

    if(typeof record.taxonRecordNameVersion[lenTaxRecNam-1]!=="undefined"){
      lastRec.taxonRecordName=record.taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
    }

    if(typeof record.lifeCycleVersion[lenLifCyc-1]!=="undefined"){
      lastRec.lifeCycle=record.lifeCycleVersion[lenLifCyc-1].lifeCycle;
    }

    if(typeof record.lifeFormVersion[lenLifFor-1]!=="undefined"){
      lastRec.lifeForm=record.lifeFormVersion[lenLifFor-1].lifeForm;
    }

    if(typeof record.identificationKeysVersion[lenIdeKey-1]!=="undefined"){
      lastRec.identificationKeys=record.identificationKeysVersion[lenIdeKey-1].identificationKeys;
    }

    if(typeof record.fullDescriptionVersion[lenFulDes-1]!=="undefined"){
      lastRec.fullDescription=record.fullDescriptionVersion[lenFulDes-1].fullDescription;
    }

    if(typeof record.briefDescriptionVersion[lenBrfDes-1]!=="undefined"){
      lastRec.briefDescription=record.briefDescriptionVersion[lenBrfDes-1].briefDescription;
    }

    if(typeof record.abstractVersion[lenAbs-1]!=="undefined"){
      lastRec.abstract=record.abstractVersion[lenAbs-1].abstract;
    }

    if(typeof record.hierarchyVersion[lenHie-1]!=="undefined"){
      lastRec.hierarchy=record.hierarchyVersion[lenHie-1].hierarchy;
    }

    if(typeof record.reproductionVersion[lenRep-1]!=="undefined"){
      lastRec.reproduction=record.reproductionVersion[lenRep-1].reproduction;
    }

    if(typeof record.annualCyclesVersion[lenAnnCyc-1]!=="undefined"){
      lastRec.annualCycles=record.annualCyclesVersion[lenAnnCyc-1].annualCycles;
    }

    if(typeof record.feedingVersion[lenFed-1]!=="undefined"){
      lastRec.feeding=record.feedingVersion[lenFed-1].feeding;
    }

    if(typeof record.dispersalVersion[lenDis-1]!=="undefined"){
      lastRec.dispersal=record.dispersalVersion[lenDis-1].dispersal;
    }

    if(typeof record.behaviorVersion[lenBeh-1]!=="undefined"){
      lastRec.behavior=record.behaviorVersion[lenBeh-1].behavior;
    }

    if(typeof record.interactionsVersion[lenInt-1]!=="undefined"){
      lastRec.interactions=record.interactionsVersion[lenInt-1].interactions;
    }

    if(typeof record.molecularDataVersion[lenMolDat-1]!=="undefined"){
      lastRec.molecularData=record.molecularDataVersion[lenMolDat-1].molecularData;
    }

    if(typeof record.migratoryVersion[lenMig-1]!=="undefined"){
      lastRec.migratory=record.migratoryVersion[lenMig-1].migratory;
    }

    if(typeof record.habitatsVersion[lenHab-1]!=="undefined"){
      lastRec.habitats=record.habitatsVersion[lenHab-1].habitats;
    }

    if(typeof record.distributionVersion[lenDistr-1]!=="undefined"){
      lastRec.distribution=record.distributionVersion[lenDistr-1].distribution;
    }

    if(typeof record.territoryVersion[lenTerr-1]!=="undefined"){
      lastRec.territory=record.territoryVersion[lenTerr-1].territory;
    }

    if(typeof record.populationBiologyVersion[lenPopBio-1]!=="undefined"){
      lastRec.populationBiology=record.populationBiologyVersion[lenPopBio-1].populationBiology;
    }

    if(typeof record.moreInformationVersion[lenMorInf-1]!=="undefined"){
      lastRec.moreInformation=record.moreInformationVersion[lenMorInf-1].moreInformation;
    }

    if(typeof record.threatStatusVersion[lenThrSta-1]!=="undefined"){
      lastRec.threatStatus=record.threatStatusVersion[lenThrSta-1].threatStatus;
    }
 
    if(typeof record.legislationVersion[lenLegs-1]!=="undefined"){
      lastRec.legislation=record.legislationVersion[lenLegs-1].legislation;
    }

    if(typeof record.usesManagementAndConservationVersion[lenUseCon-1]!=="undefined"){
      lastRec.usesManagementAndConservation=record.usesManagementAndConservationVersion[lenUseCon-1]._doc.usesManagementAndConservation;
    }
    
    if(typeof record.directThreatsVersion[lenDirThr-1]!=="undefined"){
      lastRec.directThreats=record.directThreatsVersion[lenDirThr-1].directThreats;
    }

    if(typeof record.ancillaryDataVersion[lenAncDat-1]!=="undefined"){
      lastRec.ancillaryData=record.ancillaryDataVersion[lenAncDat-1].ancillaryData;
    }

    if(typeof record.endemicAtomizedVersion[lenEndAt-1]!=="undefined"){
      lastRec.endemicAtomized=record.endemicAtomizedVersion[lenEndAt-1].endemicAtomized;
    }

    if(typeof record.referencesVersion[lenRefe-1]!=="undefined"){
      lastRec.references=record.referencesVersion[lenRefe-1].references;
    } 

    if(typeof record.environmentalEnvelopeVersion[lenEnv-1]!=="undefined"){
      lastRec.environmentalEnvelope=record.environmentalEnvelopeVersion[lenEnv-1].environmentalEnvelope;
    }

    if(typeof record.ecologicalSignificanceVersion[lenEcol-1]!=="undefined"){
      lastRec.ecologicalSignificance=record.ecologicalSignificanceVersion[lenEcol-1].ecologicalSignificance;
    }

    if(typeof record.invasivenessVersion[lenInva-1]!=="undefined"){
      lastRec.invasiveness=record.invasivenessVersion[lenInva-1].invasiveness;
    }

    
      res.json(lastRec);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.search = function(req, res) {
  var lastRec={};
  var response=[];
  var dataObject ={};
  var consl=req.params.ficha_aut_tax;
  consl = consl.replace(/\\"/g, '"');
  consl = consl.split("-");
  console.log(consl[0]);
  console.log(consl[1]);
  if(typeof consl[1] ==="undefined"){
    consl[1]="";
  }
  console.log(consl[0]);
  console.log(consl[1]);
  var query = AssociatedPartyVersion.find({'associatedParty.firstName':{ "$regex": consl[0], "$options": "i" },'associatedParty.lastName':{ "$regex": consl[1], "$options": "i" }});
  query.exec(function(err, records){
    if(records){
      console.log("Number: "+records.length);
      if(records.length){
        async.eachSeries(records, function(record, callback){
          console.log(record.id_record);
          var query2 = add_objects.RecordVersion.find({'_id' : record.id_record}).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate('taxonRecordNameVersion associatedPartyVersion');
          query2.exec(function (err, data) {
            if (err){
              console.log(err);
            }else{
              console.log(data);
              //callback();
            }
          });
          //response.push();
        },function(err){
            if(err){
              console.error("Error "+err.message);
            }else{
              console.log("All records processed");
              res.json({"message" : "Result"});
            }
        });
      }else{
        res.json({"message" : "zero records founded"});
      }
    }else{
      console.log("Error: "+err);
      res.json({"message" : "error"});
    }
  });
}

 
exports.getRecordList = function(req, res) {
  //var response={};
  var lastRec={};
  var response=[];
  var dataObject ={};
  var query = add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1}).limit(1);
  var skip = parseInt(req.query.skip);
  var limit = parseInt(req.query.limit) ;
  if(typeof skip ==="undefined" || typeof limit ==="undefined" || skip.length==0 || limit.length==0){
    query.exec(function (err, data) {
        if (err) 
          res.send(err);
        if(data.length==0){
          res.json({"message" : "No data in the database"});
        }else{
          if(data){
          var lenData=data.length;
          var lenTaxRecNam=0;
          var lenAsPar=0;
          for (i = 0; i < lenData ; i++) {
            lastRec._id=data[i]._id;
            lastRec.creation_date=data[i]._id.getTimestamp();
            lenTaxRecNam=data[i].taxonRecordNameVersion.length;
            lenAsPar=data[i].associatedPartyVersion.length;
            if(typeof data[i].associatedPartyVersion[lenAsPar-1]!=="undefined"){
              lastRec.associatedParty=data[i].associatedPartyVersion[lenAsPar-1].associatedParty;
            }else{
              lastRec.associatedParty="";
            }
  
            if(typeof data[i].taxonRecordNameVersion[lenTaxRecNam-1]!=="undefined"){
              lastRec.taxonRecordName=data[i].taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
            }else{
              lastRec.taxonRecordName="";
            }

            response.push(lastRec);
            lastRec={};
          }
          console.log(data.length);
          console.log("Resultado: "+data);
          res.json(response);
        }else{
          res.json({"message" : "No data in the database"});
        }
      }
    });
  }else{
    if (skip === 1) {
      skip = 0;
    }else {
      skip = ((skip -1)*limit) + 1;
    };
    //query=add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate({path: 'taxonRecordNameVersion'}).sort({ _id: -1}).limit(limit).skip(skip);
    var totalRecords = 0;
    add_objects.RecordVersion.find({}).count(function (err, count){
      totalRecords = count;
    });
    query = add_objects.RecordVersion.find({});
    
    
    query.skip(skip).limit(limit).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate('taxonRecordNameVersion associatedPartyVersion').exec('find', function (err, data) {
        if (err) 
          res.send(err);
        if(data.length==0){
          res.json({"message" : "No data in the database"});
        }else{
          if(data){
          var lenData=data.length;
          var lenTaxRecNam=0;
          var lenAsPar=0;
          for (i = 0; i < lenData ; i++) {
            lastRec._id=data[i]._id;
            lastRec.creation_date=data[i]._id.getTimestamp();
            lenTaxRecNam=data[i].taxonRecordNameVersion.length;
            lenAsPar=data[i].associatedPartyVersion.length;
            if(typeof data[i].associatedPartyVersion[lenAsPar-1]!=="undefined"){
              lastRec.associatedParty=data[i].associatedPartyVersion[lenAsPar-1].associatedParty;
            }else{
              lastRec.associatedParty="";
            }
  
            if(typeof data[i].taxonRecordNameVersion[lenTaxRecNam-1]!=="undefined"){
              lastRec.taxonRecordName=data[i].taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
            }else{
              lastRec.taxonRecordName="";
            }

            response.push(lastRec);
            lastRec={};
          }
          dataObject.docs = response;
          dataObject.total = totalRecords;
          console.log(totalRecords);
          //console.log("Resultado: "+data);
          res.json(dataObject);
        }else{
          res.json({"message" : "No data in the database"});
        }
      }
    });
  }
  
};