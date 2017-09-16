var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var MigratoryVersion = require('../app/models/migratory.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('migratoryVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.migratoryVersion.length;
      if(ver<=len && ver>0){
        res.json(record.migratoryVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var migratory_version  = req.body; 
  migratory_version._id = mongoose.Types.ObjectId();
  migratory_version.created=Date();
  migratory_version.element="migratory";
  var eleValue = migratory_version.migratory;
  migratory_version = new MigratoryVersion(migratory_version);

  var id_v = migratory_version._id;
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
            var lenmigratory = data.migratoryVersion.length;
            if( lenmigratory !=0 ){
              var idLast = data.migratoryVersion[lenmigratory-1];
              MigratoryVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of migratoryVersion:" + err.message));
                }else{
                  var prev = doc.migratory;
                  var next = migratory_version.migratory;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    migratory_version.id_record=id_rc;
                    migratory_version.version=lenmigratory+1;
                    callback(null, migratory_version);
                  }else{
                    callback(new Error("The data in migratory is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              migratory_version.id_record=id_rc;
              migratory_version.version=1;
              callback(null, migratory_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(migratory_version, callback){ 
          ver = migratory_version.version;
          migratory_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, migratory_version);
            }
          });
      },
      function(migratory_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "migratoryVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save MigratoryVersion', element: 'migratory', version : ver, _id: id_v, id_record : id_rc });
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