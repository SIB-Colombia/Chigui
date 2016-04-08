var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var HierarchyVersion = require('../app/models/hierarchy.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var hierarchy_version  = req.body;
  hierarchy_version._id = mongoose.Types.ObjectId();

  hierarchy_version.created=Date();
  hierarchy_version.state="accepted";
  hierarchy_version.element="hierarchy";
  hierarchy_version = new HierarchyVersion(hierarchy_version);

  var id_v = hierarchy_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "hierarchyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            hierarchy_version.id_record=id_rc;
            hierarchy_version.version=doc.hierarchyVersion.length+1;
            var ver = hierarchy_version.version;
            hierarchy_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }{
                res.json({ message: 'Saved HierarchyVersion', element: 'Hierarchy', version : ver, _id: id_v, id_record : id_rc });
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
  var ver=req.params.version;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('hierarchyVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.hierarchyVersion.length;
      if(ver<=len && ver>0){
        res.json(record.hierarchyVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



