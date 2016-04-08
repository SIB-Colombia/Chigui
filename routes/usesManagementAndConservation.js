var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var UsesManagementAndConservationVersion = require('../app/models/usesManagementAndConservation.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('usesManagementAndConservationVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.usesManagementAndConservationVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.usesManagementAndConservationVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};

exports.postVersion = function(req, res) {
  var uses_management_and_conservation_version  = req.body; 
  uses_management_and_conservation_version._id = mongoose.Types.ObjectId();

  uses_management_and_conservation_version.created=Date();
  uses_management_and_conservation_version.state="accepted";
  uses_management_and_conservation_version.element="usesManagementAndConservation";
  uses_management_and_conservation_version = new UsesManagementAndConservationVersion(uses_management_and_conservation_version);

  var id_v = uses_management_and_conservation_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "usesManagementAndConservationVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            uses_management_and_conservation_version.id_record=id_rc;
            uses_management_and_conservation_version.version=doc.usesManagementAndConservationVersion.length+1;
            var ver = uses_management_and_conservation_version.version;
            uses_management_and_conservation_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save UsesManagementAndConservationVersion', element: 'usesManagementAndConservationVersion', version : ver, _id: id_v, id_record : id_rc });
              }
            });
          }
        });
      }
    }else{
      res.status(406);
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  }
    );
  }else{
    res.status(406);
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}