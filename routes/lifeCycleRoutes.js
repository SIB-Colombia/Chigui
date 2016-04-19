var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var LifeCycleVersion = require('../app/models/lifeCycle.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var life_cycle_version  = req.body; 
  //console.log(life_cycle_version);
  life_cycle_version._id = mongoose.Types.ObjectId();

  life_cycle_version.created=Date();
  life_cycle_version.state="accepted";
  life_cycle_version.element="lifeCycle";
  life_cycle_version = new LifeCycleVersion(life_cycle_version);

  var id_v = life_cycle_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "lifeCycleVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            life_cycle_version.id_record=id_rc;
            life_cycle_version.version=doc.lifeCycleVersion.length+1;
            var ver = life_cycle_version.version;
            life_cycle_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save LifeCycleVersion', element: 'LifeCycle', version : ver, _id: id_v, id_record : id_rc });
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


exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('lifeCycleVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.lifeCycleVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.lifeCycleVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};



