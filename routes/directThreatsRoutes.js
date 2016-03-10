var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var DirectThreatsVersion = require('../app/models/directThreats.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var direct_threats_version  = req.body; 
  //console.log(direct_threats_version);
  direct_threats_version._id = mongoose.Types.ObjectId();
  direct_threats_version.created=Date();
  var eleValue = direct_threats_version.directThreats;
  direct_threats_version = new DirectThreatsVersion(direct_threats_version);

  var id_v = direct_threats_version._id;
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
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "directThreatsVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          direct_threats_version.id_record=id_rc;
          direct_threats_version.version=doc.directThreatsVersion.length+1;
          var ver = direct_threats_version.version;
          direct_threats_version.save(function(err){
            if(err){
             res.send(err);
            }
            res.json({ message: 'Save DirectThreatsVersion', element: 'directThreats', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('directThreatsVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.directThreatsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.directThreatsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};