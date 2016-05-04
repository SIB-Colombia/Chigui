var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var CommonNamesAtomizedVersion = require('../app/models/commonNamesAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var common_names_atomized_version  = req.body; 
  common_names_atomized_version._id = mongoose.Types.ObjectId();
  common_names_atomized_version.created=Date();
  common_names_atomized_version.element="commonNamesAtomized";
  var elementTemp=req.body.commonNamesAtomized;
  if(typeof  elementTemp!=="undefined" && elementTemp.length!=0){
    common_names_atomized_version.commonNamesAtomized=elementTemp;
  }else{
    common_names_atomized_version.commonNamesAtomized=req.body.commonNameAtomized;
  }
  var eleValue = common_names_atomized_version.commonNamesAtomized;
  common_names_atomized_version = new CommonNamesAtomizedVersion(common_names_atomized_version);

  var id_v = common_names_atomized_version._id;
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
            var lencommonNamesAtomized = data.commonNamesAtomizedVersion.length;
            if( lencommonNamesAtomized !=0 ){
              var idLast = data.commonNamesAtomizedVersion[lencommonNamesAtomized-1];
              CommonNamesAtomizedVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of commonNamesAtomizedVersion:" + err.message));
                }else{
                  var prev = doc.commonNamesAtomized;
                  var next = common_names_atomized_version.commonNamesAtomized;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    common_names_atomized_version.id_record=id_rc;
                    common_names_atomized_version.version=lencommonNamesAtomized+1;
                    callback(null, common_names_atomized_version);
                  }else{
                    callback(new Error("The data in commonNamesAtomized is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              common_names_atomized_version.id_record=id_rc;
              common_names_atomized_version.version=1;
              callback(null, common_names_atomized_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(common_names_atomized_version, callback){ 
          ver = common_names_atomized_version.version;
          common_names_atomized_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, common_names_atomized_version);
            }
          });
      },
      function(common_names_atomized_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "commonNamesAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save CommonNamesAtomizedVersion', element: 'commonNamesAtomized', version : ver, _id: id_v, id_record : id_rc });
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
