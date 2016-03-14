var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var MoreInformationVersion = require('../app/models/moreInformation.js');
var add_objects = require('../app/models/additionalModels.js');
var compare = require('../app/utils/moreInformationCompare.js');
var cors = require;

exports.postVersion = function(req, res) {
  var more_information_version  = req.body; 
  more_information_version._id = mongoose.Types.ObjectId();
  more_information_version.created=Date();
  var eleValue = more_information_version.moreInformation;
  more_information_version = new MoreInformationVersion(more_information_version);

  var id_v = more_information_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    console.log(eleValue);
    console.log(typeof  eleValue!=="undefined" && eleValue!="");
    console.log(typeof  eleValue!=="undefined");
    console.log(eleValue!="");
    if(typeof  eleValue!=="undefined" && eleValue!=""){ 
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{ 
       add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "moreInformationVersion": id_v } },{ safe: true, upsert: true }).populate('moreInformationVersion').exec(function (err, record) { 
        if (err){
              res.send(err);
          }
          more_information_version.id_record=id_rc;
          more_information_version.version=record.moreInformationVersion.length+1;
          var len = record.moreInformationVersion.length;
          var prev = record.moreInformationVersion[len-1].moreInformation;
          var next = more_information_version.moreInformation;

          if(!compare.isEqual(prev,next)){
            more_information_version.id_record=id_rc;
            more_information_version.version=record.moreInformationVersion.length+1;
            var ver = more_information_version.version;
            more_information_version.save(function(err){
              if(err){
                res.send(err);
              }
              res.json({ message: 'Save MoreInformationVersion', element: 'moreInformation', version : ver, _id: id_v, id_record : id_rc });
            });
          }else{
            res.status(406);
            res.json({ message: 'The data in moreInformation is equal to last version of this element in the database' });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('moreInformationVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.moreInformationVersion.length;
      if(ver<=len && ver>0){
        res.json(record.moreInformationVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};