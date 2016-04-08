var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var SynonymsAtomizedVersion = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var synonyms_atomized_version  = req.body; 
  //console.log(synonyms_atomized_version);
  synonyms_atomized_version._id = mongoose.Types.ObjectId();

  synonyms_atomized_version.created=Date();
  synonyms_atomized_version.state="accepted";
  synonyms_atomized_version.element="synonymsAtomized";
  synonyms_atomized_version = new SynonymsAtomizedVersion(synonyms_atomized_version);
  var id_v = synonyms_atomized_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            synonyms_atomized_version.id_record=id_rc;
            synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
            var ver = synonyms_atomized_version.version;
            synonyms_atomized_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save SynonymsAtomizedVersion', element: 'SynonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
              }
            });
          }
        });
      }
    }else{
      res.status(406);
      res.json({message: "Empty Database"});
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
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('synonymsAtomizedVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.synonymsAtomizedVersion.length;
      if(ver<=len && ver>0){
        res.json(record.synonymsAtomizedVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



