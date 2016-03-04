var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var AssociatedPartyVersion = require('../app/models/associatedParty.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var associated_party_version  = req.body; 
  //console.log(associated_party_version);
  associated_party_version._id = mongoose.Types.ObjectId();

  associated_party_version.created=Date();
  associated_party_version = new AssociatedPartyVersion(associated_party_version);

  var id_v = associated_party_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "associatedPartyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          associated_party_version.id_record=id_rc;
          associated_party_version.version=doc.associatedPartyVersion.length+1;
          var ver = associated_party_version.version;
          associated_party_version.save(function(err){
            if(err){
              res.send(err);
            }
            res.json({ message: 'Save AssociatedPartyVersion', element: 'AssociatedParty', version : ver, _id: id_v, id_record : id_rc });
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


exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.associatedPartyVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.associatedPartyVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};



