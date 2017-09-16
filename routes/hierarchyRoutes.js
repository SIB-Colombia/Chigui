var express = require('express');
var async = require('async');
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
  hierarchy_version.element="hierarchy";
  var eleValue = hierarchy_version.hierarchy;
  hierarchy_version = new HierarchyVersion(hierarchy_version);

  var id_v = hierarchy_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  var ver = "";

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
      async.waterfall([
        function(callback){ 
          add_objects.RecordVersion.findById(id_rc , function (err, data){
            if(err){
              //callback(new Error("failed getting something!:" + err.message));
              callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
            }else{
              callback(null, data);
            }
          });
        },
        function(data,callback){ 
          if(data){
            var lenhierarchy = data.hierarchyVersion.length;
            if( lenhierarchy !=0 ){
              var idLast = data.hierarchyVersion[lenhierarchy-1];
              HierarchyVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of hierarchyVersion:" + err.message));
                }else{
                  var prev = doc.hierarchy;
                  var next = hierarchy_version.hierarchy;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    hierarchy_version.id_record=id_rc;
                    hierarchy_version.version=lenhierarchy+1;
                    callback(null, hierarchy_version);
                  }else{
                    callback(new Error("The data in hierarchy is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              hierarchy_version.id_record=id_rc;
              hierarchy_version.version=1;
              callback(null, hierarchy_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(hierarchy_version, callback){ 
          ver = hierarchy_version.version;
          hierarchy_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, hierarchy_version);
            }
          });
      },
      function(hierarchy_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "hierarchyVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
            if(err){
              callback(new Error("failed added id to RecordVersion:" + err.message));
            }else{
              callback();
            }
          });
      }
      ],function(err, result) {
          if (err) {
            console.log("Error: "+err);
            res.status(406);
            res.json({ message: ""+err });
          }else{
            res.json({ message: 'Save HierarchyVersion', element: 'hierarchy', version : ver, _id: id_v, id_record : id_rc });
          }
        }
      );
   }else{
    res.status(406);
    res.json({message: "Empty data in version of the element"});
   } 
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



