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
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion').exec(function (err, record) {
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
  		res.json(record);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};

exports.getRecordList = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  var lastRec={};
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion').exec(function (err, record) {
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
      res.json(record);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};