var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var FeedingVersion = require('../app/models/feeding.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var feeding_version  = req.body; 
  feeding_version._id = mongoose.Types.ObjectId();
  feeding_version.created=Date();
  feeding_version.state="accepted";
  feeding_version.element="feeding";
  var eleValue = feeding_version.feeding;
  feeding_version = new FeedingVersion(feeding_version);

  var id_v = feeding_version._id;
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
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "feedingVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            feeding_version.id_record=id_rc;
            feeding_version.version=doc.feedingVersion.length+1;
            var ver = feeding_version.version;
            feeding_version.save(function(err){
              if(err){
               res.status(406);
               res.send(err);
              }else{
                res.json({ message: 'Save FeedingVersion', element: 'feeding', version : ver, _id: id_v, id_record : id_rc });
              }
            });
          }
        });
      }
      }else{
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('feedingVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.feedingVersion.length;
      if(ver<=len && ver>0){
        res.json(record.feedingVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};