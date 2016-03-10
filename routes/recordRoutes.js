var express = require('express');
var mongoosePaginate = require('mongoose-paginate');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../app/models/taxonRecordName.js');
var AssociatedPartyVersion = require('../app/models/associatedParty.js');
var add_objects = require('../app/models/additionalModels.js');
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var cors = require;

RecordVersion.plugin(mongoosePaginate);

var exports = module.exports = {}

exports.getRecord = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion').exec(function (err, record) {
	//console.log(record);
    if(record){
  		if (err){
  			res.send(err);
  		};
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
    add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion molecularDataVersion migratoryVersion habitatsVersion distributionVersion territoryVersion populationBiologyVersion').exec(function (err, record) {
  //console.log(record);
    if(record){
      if (err){
        res.send(err);
      };
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
    //
      /*
      var lenThrSta = record.threatStatusVersion.length; 
      var lenDirThr = record.directThreatsVersion.length; 
      var lenLegs = record.legislationVersion.length; 
      var lenUseAt = record.usesAtomizedVersion.length; 
      var lenManCon = record.managementAndConservationVersion.length; 
      var lenMeaFac = record.measurementOrFactVersion.length; 
      var lenRefe = record.referencesVersion.length; 
      var lenDetAt = record.detailAtomizedVersion.length; 
      var lenAncDat = record.ancillaryDataVersion.length;
      */

      //console.log(record.associatedPartyVersion);
    if(typeof record.associatedPartyVersion[lenAsPar-1]!=="undefined"){
      lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1].associatedParty;
    }else{
      lastRec.associatedParty="";
    }

    if(typeof record.baseElementsVersion[lenBasEl-1]!=="undefined"){
      lastRec.baseElements=record.baseElementsVersion[lenBasEl-1].baseElements;
    }else{
      lastRec.baseElements="";
    }
    if(typeof record.commonNamesAtomizedVersion[lenComNameAt-1]!=="undefined"){
      lastRec.commonNamesAtomized=record.commonNamesAtomizedVersion[lenComNameAt-1].commonNamesAtomized;
    }else{
      lastRec.commonNamesAtomized="";
    }

    if(typeof record.synonymsAtomizedVersion[lenSyAt-1]!=="undefined"){
      lastRec.synonymsAtomized=record.synonymsAtomizedVersion[lenSyAt-1].synonymsAtomized;
    }else{
      lastRec.synonymsAtomized="";
    }

    if(typeof record.taxonRecordNameVersion[lenTaxRecNam-1]!=="undefined"){
      lastRec.taxonRecordName=record.taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
    }else{
      lastRec.taxonRecordName="";
    }

    if(typeof record.lifeCycleVersion[lenLifCyc-1]!=="undefined"){
      lastRec.lifeCycle=record.lifeCycleVersion[lenLifCyc-1].lifeCycle;
    }else{
      lastRec.lifeCycle="";
    }

    if(typeof record.lifeFormVersion[lenLifFor-1]!=="undefined"){
      lastRec.lifeForm=record.lifeFormVersion[lenLifFor-1].lifeForm;
    }else{
      lastRec.lifeForm="";
    }

    if(typeof record.identificationKeysVersion[lenIdeKey-1]!=="undefined"){
      lastRec.identificationKeys=record.identificationKeysVersion[lenIdeKey-1].identificationKeys;
    }else{
      lastRec.identificationKeys="";
    }

    if(typeof record.fullDescriptionVersion[lenFulDes-1]!=="undefined"){
      lastRec.fullDescription=record.fullDescriptionVersion[lenFulDes-1].fullDescription;
    }else{
      lastRec.fullDescription="";
    }

    if(typeof record.briefDescriptionVersion[lenBrfDes-1]!=="undefined"){
      lastRec.briefDescription=record.briefDescriptionVersion[lenBrfDes-1].briefDescription;
    }else{
      lastRec.briefDescription="";
    }

    if(typeof record.abstractVersion[lenAbs-1]!=="undefined"){
      lastRec.abstract=record.abstractVersion[lenAbs-1].abstract;
    }else{
      lastRec.abstract="";
    }

    if(typeof record.hierarchyVersion[lenHie-1]!=="undefined"){
      lastRec.hierarchy=record.hierarchyVersion[lenHie-1].hierarchy;
    }else{
      lastRec.hierarchy="";
    }

    if(typeof record.reproductionVersion[lenRep-1]!=="undefined"){
      lastRec.reproduction=record.reproductionVersion[lenRep-1].reproduction;
    }else{
      lastRec.reproduction="";
    }

    if(typeof record.annualCyclesVersion[lenAnnCyc-1]!=="undefined"){
      lastRec.annualCycles=record.annualCyclesVersion[lenAnnCyc-1].annualCycles;
    }else{
      lastRec.annualCycles="";
    }

    if(typeof record.feedingVersion[lenFed-1]!=="undefined"){
      lastRec.feeding=record.feedingVersion[lenFed-1].feeding;
    }else{
      lastRec.feeding="";
    }

    if(typeof record.dispersalVersion[lenDis-1]!=="undefined"){
      lastRec.dispersal=record.dispersalVersion[lenDis-1].dispersal;
    }else{
      lastRec.dispersal="";
    }

    if(typeof record.behaviorVersion[lenBeh-1]!=="undefined"){
      lastRec.behavior=record.behaviorVersion[lenBeh-1].behavior;
    }else{
      lastRec.behavior="";
    }

    if(typeof record.interactionsVersion[lenInt-1]!=="undefined"){
      lastRec.interactions=record.interactionsVersion[lenInt-1].interactions;
    }else{
      lastRec.interactions="";
    }

    if(typeof record.molecularDataVersion[lenMolDat-1]!=="undefined"){
      lastRec.molecularData=record.molecularDataVersion[lenMolDat-1].molecularData;
    }else{
      lastRec.molecularData="";
    }

    if(typeof record.migratoryVersion[lenMig-1]!=="undefined"){
      lastRec.migratory=record.migratoryVersion[lenMig-1].migratory;
    }else{
      lastRec.migratory="";
    }

    if(typeof record.habitatsVersion[lenHab-1]!=="undefined"){
      lastRec.habitats=record.habitatsVersion[lenHab-1].habitats;
    }else{
      lastRec.habitats="";
    }

    if(typeof record.distributionVersion[lenDistr-1]!=="undefined"){
      lastRec.distribution=record.distributionVersion[lenDistr-1].distribution;
    }else{
      lastRec.distribution="";
    }

    if(typeof record.territoryVersion[lenTerr-1]!=="undefined"){
      lastRec.territory=record.territoryVersion[lenTerr-1].territory;
    }else{
      lastRec.territory="";
    }

    if(typeof record.populationBiologyVersion[lenPopBio-1]!=="undefined"){
      lastRec.populationBiology=record.populationBiologyVersion[lenPopBio-1].populationBiology;
    }else{
      lastRec.populationBiology="";
    }
 
      
      
    //
    /*
    if(typeof record.threatStatusVersion[lenThrSta-1]!=="undefined"){
      lastRec.threatStatus=record.threatStatusVersion[lenThrSta-1].threatStatus;
    }else{
      lastRec.threatStatus="";
    }

    if(typeof record.directThreatsVersion[lenDirThr-1]!=="undefined"){
      lastRec.directThreats=record.directThreatsVersion[lenDirThr-1].directThreats;
    }else{
      lastRec.directThreats="";
    }

    if(typeof record.legislationVersion[lenLegs-1]!=="undefined"){
      lastRec.legislation=record.legislationVersion[lenLegs-1].legislation;
    }else{
      lastRec.legislation="";
    }

    if(typeof record.usesAtomizedVersion[lenUseAt-1]!=="undefined"){
      lastRec.usesAtomized=record.usesAtomizedVersion[lenUseAt-1].usesAtomized;
    }else{
      lastRec.usesAtomized="";
    }

    if(typeof record.managementAndConservationVersion[lenManCon-1]!=="undefined"){
      lastRec.managementAndConservation = record.managementAndConservationVersion[lenManCon-1].managementAndConservation;
    }else{
      lastRec.managementAndConservation ="";
    }

    if(typeof record.measurementOrFactVersion[lenMeaFac-1]!=="undefined"){
      lastRec.measurementOrFact=record.measurementOrFactVersion[lenMeaFac-1].measurementOrFact;
    }else{
      lastRec.measurementOrFact ="";
    }

    if(typeof record.referencesVersion[lenRefe-1]!=="undefined"){
      lastRec.references=record.referencesVersion[lenRefe-1].references;
    }else{
      lastRec.references ="";
    }

    if(typeof record.detailAtomizedVersion[lenDetAt-1]!=="undefined"){
      lastRec.detailAtomized=record.detailAtomizedVersion[lenDetAt-1].detailAtomized;
    }else{
      lastRec.detailAtomized ="";
    }

    if(typeof record.ancillaryDataVersion[lenAncDat-1]!=="undefined"){
      lastRec.ancillaryData=record.ancillaryDataVersion[lenAncDat-1].ancillaryData;
    }else{
      lastRec.ancillaryData ="";
    }
      
      
      
      */
      //console.log(lastRec);
      res.json(lastRec);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

 
exports.getRecordList = function(req, res) {
  //var response={};
  var lastRec={};
  var response=[];
  var query = add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1});
  var skip = req.query.skip;
  var limit = req.query.limit ;
  if(typeof skip ==="undefined" || typeof limit ==="undefined" || skip.length==0 || limit.length==0){
    query.exec(function (err, data) {
        if (err) 
          res.send(err);
        if(data.length==0){
          res.json({"message" : "No data in the database"});
        }else{
          /*
          var creation_date="";
          for(i=0;i<data.length;i++){
            if(typeof  data[i]._doc.creation_date==="undefined"){
              creation_date=data[i]._id.getTimestamp();
              data[i]._doc.creation_date =creation_date.toString();
            }
          }
          */
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
    query=add_objects.RecordVersion.find({ skip: 10, limit: 5 }).select('taxonRecordNameVersion associatedPartyVersion creation_date').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1});
    query.exec(function (err, data) {
        if (err) 
          res.send(err);
        if(data.length==0){
          res.json({"message" : "No data in the database"});
        }else{
          var creation_date="";
          for(i=0;i<data.length;i++){
            if(typeof  data[i]._doc.creation_date==="undefined"){
              creation_date=data[i]._id.getTimestamp();
              data[i]._doc.creation_date =creation_date.toString();
            }
          }
          console.log(data.length);
          console.log("Resultado: "+data);
          res.json(data);
      }
    });
  }
  
};