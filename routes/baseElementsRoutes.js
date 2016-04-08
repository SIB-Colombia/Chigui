var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var BaseElementsVersion = require('../app/models/baseElements.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var base_elements_version  = req.body; 
  //console.log(base_elements_version);
  base_elements_version._id = mongoose.Types.ObjectId();
  base_elements_version.created=Date();
  var eleValue = base_elements_version.baseElements;
  base_elements_version = new BaseElementsVersion(base_elements_version);

  var id_v = base_elements_version._id;
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
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "baseElementsVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          base_elements_version.id_record=id_rc;
          base_elements_version.version=doc.baseElementsVersion.length+1;
          var ver = base_elements_version.version;
          base_elements_version.save(function(err){
            if(err){
              res.send(err);
            }else{
              res.json({ message: 'Save BaseElementsVersion', element: 'BaseElements', version : ver, _id: id_v, id_record : id_rc });
            }
          });
        });
      }
      }else{
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }
    }
    );
    }else{
      res.json({message: "Empty data in version of the element"});
    }
  }else{
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}


exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('baseElementsVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.baseElementsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.baseElementsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



