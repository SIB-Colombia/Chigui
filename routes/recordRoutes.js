var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var IdentificationKeysVersion = require('../app/models/identificationKeys.js');
var add_objects = require('../app/models/additionalModels.js');
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var cors = require;

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

      lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1].associatedParty;
      lastRec.baseElements=record.baseElementsVersion[lenBasEl-1].baseElements;
      lastRec.commonNamesAtomized=record.commonNamesAtomizedVersion[lenComNameAt-1].commonNamesAtomized;
      lastRec.synonymsAtomized=record.synonymsAtomizedVersion[lenSyAt-1].synonymsAtomized;
      lastRec.taxonRecordName=record.taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
      lastRec.lifeCycle=record.lifeCycleVersion[lenLifCyc-1].lifeCycle;
      lastRec.lifeForm=record.lifeFormVersion[lenLifFor-1].lifeForm;
      lastRec.identificationKeys=record.identificationKeysVersion[lenIdeKey-1].identificationKeys;
      lastRec.fullDescription=record.fullDescriptionVersion[lenFulDes-1].fullDescription;
      lastRec.briefDescription=record.briefDescriptionVersion[lenBrfDes-1].briefDescription;
      lastRec.abstract=record.abstractVersion[lenAbs-1].abstract;
      lastRec.hierarchy=record.hierarchyVersion[lenHie-1].hierarchy;
      lastRec.reproduction=record.reproductionVersion[lenRep-1].reproduction;
      lastRec.annualCycles=record.annualCyclesVersion[lenAnnCyc-1].annualCycles;
      lastRec.feeding=record.feedingVersion[lenFed-1].feeding;
      lastRec.dispersal=record.dispersalVersion[lenDis-1].dispersal;
      lastRec.behavior=record.behaviorVersion[lenBeh-1].behavior;
      lastRec.interactions=record.interactionsVersion[lenInt-1].interactions;
    //
      lastRec.molecularData=record.molecularDataVersion[lenMolDat-1].molecularData;
      lastRec.migratory=record.migratoryVersion[lenMig-1].migratory;
      lastRec.habitats=record.habitatsVersion[lenHab-1].habitats;
      lastRec.distribution=record.distributionVersion[lenDistr-1].distribution;
      lastRec.territory=record.territoryVersion[lenTerr-1].territory;
      lastRec.populationBiology=record.populationBiologyVersion[lenPopBio-1].populationBiology;
    //
    /*
      lastRec.threatStatus=record.threatStatusVersion[lenThrSta-1].threatStatus;
      lastRec.directThreats=record.directThreatsVersion[lenDirThr-1].directThreats;
      lastRec.legislation=record.legislationVersion[lenLegs-1].legislation;
      lastRec.usesAtomized=record.usesAtomizedVersion[lenUseAt-1].usesAtomized;
      lastRec.managementAndConservation=record.managementAndConservationVersion[lenManCon-1].managementAndConservation;
      lastRec.measurementOrFact=record.measurementOrFactVersion[lenMeaFac-1].measurementOrFact;
      lastRec.references=record.referencesVersion[lenRefe-1].references;
      lastRec.detailAtomized=record.detailAtomizedVersion[lenDetAt-1].detailAtomized;
      lastRec.ancillaryData=record.ancillaryDataVersion[lenAncDat-1].ancillaryData;
      */
      //console.log(lastRec);
      res.json(lastRec);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};