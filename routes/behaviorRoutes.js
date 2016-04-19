var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var BehaviorVersion = require('../app/models/behavior.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var behavior_version  = req.body; 
  behavior_version._id = mongoose.Types.ObjectId();
  behavior_version.created=Date();
  behavior_version.state="accepted";
  behavior_version.element="behavior";
  var eleValue = behavior_version.behavior;
  behavior_version = new BehaviorVersion(behavior_version);

  var id_v = behavior_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "behaviorVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            behavior_version.id_record=id_rc;
            behavior_version.version=doc.behaviorVersion.length+1;
            var ver = behavior_version.version;
            behavior_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save BehaviorVersion', element: 'behavior', version : ver, _id: id_v, id_record : id_rc });
              }
            });
          }
        });
      }
      }else{
        res.status(406);
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }
   });
   }else{
    res.status(406);
    res.json({message: "Empty data in version of the element"});
   } 
  }else{
    res.status(406);
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
};

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('behaviorVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.behaviorVersion.length;
      if(ver<=len && ver>0){
        res.json(record.behaviorVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};