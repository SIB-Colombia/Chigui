var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var UsesManagementAndConservationVersion = require('../app/models/usesManagementAndConservation.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('usesManagementAndConservationVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.usesManagementAndConservationVersion.length;
      if(ver<=len && ver>0){
        res.json(record.usesManagementAndConservationVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var uses_management_and_conservation_version  = req.body; 
  uses_management_and_conservation_version._id = mongoose.Types.ObjectId();
  uses_management_and_conservation_version.created=Date();
  uses_management_and_conservation_version.state="accepted";
  uses_management_and_conservation_version.element="usesManagementAndConservation";
  var eleValue = uses_management_and_conservation_version.usesManagementAndConservation;
  uses_management_and_conservation_version = new UsesManagementAndConservationVersion(uses_management_and_conservation_version);

  var id_v = uses_management_and_conservation_version._id;
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
            var lenusesManagementAndConservation = data.usesManagementAndConservationVersion.length;
            if( lenusesManagementAndConservation !=0 ){
              var idLast = data.usesManagementAndConservationVersion[lenusesManagementAndConservation-1];
              UsesManagementAndConservationVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of usesManagementAndConservationVersion:" + err.message));
                }else{
                  var prev = doc.usesManagementAndConservation;
                  var next = uses_management_and_conservation_version.usesManagementAndConservation;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    uses_management_and_conservation_version.id_record=id_rc;
                    uses_management_and_conservation_version.version=lenusesManagementAndConservation+1;
                    callback(null, uses_management_and_conservation_version);
                  }else{
                    callback(new Error("The data in usesManagementAndConservation is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              uses_management_and_conservation_version.id_record=id_rc;
              uses_management_and_conservation_version.version=1;
              callback(null, uses_management_and_conservation_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(uses_management_and_conservation_version, callback){ 
          ver = uses_management_and_conservation_version.version;
          uses_management_and_conservation_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, uses_management_and_conservation_version);
            }
          });
      },
      function(uses_management_and_conservation_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "usesManagementAndConservationVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save UsesManagementAndConservationVersion', element: 'usesManagementAndConservation', version : ver, _id: id_v, id_record : id_rc });
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