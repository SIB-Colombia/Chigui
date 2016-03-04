var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var EnvironmentalEnvelopeVersion = require('../app/models/environmentalEnvelope.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('environmentalEnvelopeVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.environmentalEnvelopeVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.environmentalEnvelopeVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};

exports.postVersion = function(req, res) {
  var environmental_envelope_version  = req.body; 
  //console.log(identification_keys_version);
  environmental_envelope_version._id = mongoose.Types.ObjectId();

  environmental_envelope_version.created=Date();
  environmental_envelope_version = new EnvironmentalEnvelopeVersion(environmental_envelope_version);

  var id_v = environmental_envelope_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "environmentalEnvelopeVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          environmental_envelope_version.id_record=id_rc;
          environmental_envelope_version.version=doc.environmentalEnvelopeVersion.length+1;
          var ver = environmental_envelope_version.version;
          environmental_envelope_version.save(function(err){
            if(err){
              res.send(err);
            }
            res.json({ message: 'Save EnvironmentalEnvelopeVersion', element: 'environmentalEnvelopeVersion', version : ver, _id: id_v, id_record : id_rc });
          });
        });
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  }
    );
  }else{
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}