var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var DispersalVersion = require('../app/models/dispersal.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var dispersal_version  = req.body; 
  dispersal_version._id = mongoose.Types.ObjectId();
  dispersal_version.created=Date();
  dispersal_version.state="accepted";
  dispersal_version.element="dispersal";
  var eleValue = dispersal_version.dispersal;
  dispersal_version = new DispersalVersion(dispersal_version);

  console.log("distance: "+dispersal_version);
  console.log("keys: "+Object.keys(dispersal_version));
  console.log("doc: "+dispersal_version._doc);
  console.log("keys: "+Object.keys(dispersal_version._doc));
  console.log("doc: "+dispersal_version._doc.dispersal);
  console.log("doc req: "+Object.keys(req.body));
  console.log("doc req: "+Object.keys(req.body.dispersal));

  var id_v = dispersal_version._id;
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
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "dispersalVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            dispersal_version.id_record=id_rc;
            dispersal_version.version=doc.dispersalVersion.length+1;
            var ver = dispersal_version.version;
            dispersal_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save DispersalVersion', element: 'dispersal', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('dispersalVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.dispersalVersion.length;
      if(ver<=len && ver>0){
        res.json(record.dispersalVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};