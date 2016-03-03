var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var CommonNamesAtomizedVersion = require('../app/models/commonNamesAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var common_names_atomized_version  = req.body; 
  //console.log(common_names_atomized_version);
  common_names_atomized_version._id = mongoose.Types.ObjectId();

  common_names_atomized_version.created=Date();
  common_names_atomized_version = new CommonNamesAtomizedVersion(common_names_atomized_version);

  var id_v = common_names_atomized_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "commonNamesAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          common_names_atomized_version.id_record=id_rc;
          common_names_atomized_version.version=doc.commonNamesAtomizedVersion.length+1;
          var ver = common_names_atomized_version.version;
          common_names_atomized_version.save(function(err){
            if(err){
              res.send(err);
            }
            res.json({ message: 'Saved CommonNamesAtomizedVersion', element: 'CommonNamesAtomized', version : ver, _id: id_v, id_record : id_rc });
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
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('commonNamesAtomizedVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.commonNamesAtomizedVersion.length;
      if(ver<=len && ver>0){
        res.json(record.commonNamesAtomizedVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



