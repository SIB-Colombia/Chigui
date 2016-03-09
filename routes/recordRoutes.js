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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion').exec(function (err, record) {
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

      lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1];
      lastRec.baseElements=record.baseElementsVersion[lenBasEl-1];
      lastRec.commonNamesAtomized=record.commonNamesAtomizedVersion[lenComNameAt-1];
      lastRec.synonymsAtomized=record.synonymsAtomizedVersion[lenSyAt-1];
      lastRec.taxonRecordName=record.taxonRecordNameVersion[lenTaxRecNam-1];
      lastRec.lifeCycle=record.lifeCycleVersion[lenLifCyc-1];
      lastRec.lifeForm=record.lifeFormVersion[lenLifFor-1];
      lastRec.identificationKeys=record.identificationKeysVersion[lenIdeKey-1];
      lastRec.fullDescription=record.fullDescriptionVersion[lenFulDes-1];
      lastRec.briefDescription=record.briefDescriptionVersion[lenBrfDes-1];
      lastRec.abstract=record.abstractVersion[lenAbs-1];
      lastRec.hierarchy=record.hierarchyVersion[lenHie-1];
      lastRec.reproduction=record.reproductionVersion[lenRep-1];
      lastRec.annualCycles=record.annualCyclesVersion[lenAnnCyc-1];
      lastRec.feeding=record.feedingVersion[lenFed-1];
      lastRec.dispersal=record.dispersalVersion[lenDis-1];
      lastRec.behavior=record.behaviorVersion[lenBeh-1];
      lastRec.interactions=record.interactionsVersion[lenInt-1];
      //console.log(lastRec);
      res.json(lastRec);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};