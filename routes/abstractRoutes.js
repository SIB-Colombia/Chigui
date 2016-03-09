var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var AbstractVersion = require('../app/models/abstract.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var abstract_version  = req.body; 
  console.log(abstract_version);
  abstract_version._id = mongoose.Types.ObjectId();
  abstract_version.created=Date();
  var eleValue = abstract_version.abstract;
  abstract_version = new AbstractVersion(abstract_version);

  var id_v = abstract_version._id;
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
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "abstractVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          abstract_version.id_record=id_rc;
          abstract_version.version=doc.abstractVersion.length+1;
          var ver = abstract_version.version;
          abstract_version.save(function(err){
            if(err){
             res.send(err);
            }
            res.json({ message: 'Save AbstractVersion', element: 'abstract', version : ver, _id: id_v, id_record : id_rc });
         });
        });
      }
      }else{
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }
   });
   }else{
    res.json({message: "Empty data in version of the element"});
   } 
  }else{
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
};

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('abstractVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.abstractVersion.length;
      if(ver<=len && ver>0){
        res.json(record.abstractVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};